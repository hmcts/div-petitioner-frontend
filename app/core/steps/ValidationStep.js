const { filter, isEqual, map, mapValues, reduce, uniqWith, cloneDeep, find } = require('lodash');
const staleDataManager = require('app/core//helpers/staleDataManager');
const Ajv = require('ajv');
const Step = require('./Step');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const {
  restoreFromDraftStore,
  saveSessionToDraftStore,
  saveSessionToDraftStoreAndClose,
  saveSessionToDraftStoreAndReply
} = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const fs = require('fs');
const requestHandler = require('app/core/helpers/parseRequest');
const walkMap = require('app/core/utils/treeWalker');
const removeEmptyValues = require('app/core/helpers/removeEmptyValues');

const ajv = new Ajv({ allErrors: true, v5: true });

module.exports = class ValidationStep extends Step {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      restoreFromDraftStore,
      setIdamUserDetails,
      hasSubmitted,
      saveSessionToDraftStoreAndClose
    ];
  }

  get postMiddleware() {
    return [
      saveSessionToDraftStore,
      saveSessionToDraftStoreAndReply
    ];
  }

  get schema() {
    if (!this.schemaFile) {
      throw new TypeError(`Step ${this.name} has no schema file in it's resource folder`);
    }

    return this.schemaFile;
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content);

    this.schemaFile = schema;
    this.validateSchema = ajv.compile(this.schema);
    this.properties = this.uniqueProperties(this.schema);
  }

  next(pathData, session) { // eslint-disable-line no-unused-vars
    if (this.nextStep instanceof Step) {
      return super.next(pathData);
    }

    let error; // eslint-disable-line init-declarations
    let val; // eslint-disable-line init-declarations
    const path = [];

    const f = (v, k) => {
      if (!pathData.hasOwnProperty(k)) {
        return false;
      }

      path.push(k, pathData[k]);

      if (v[pathData[k]] instanceof Step) {
        val = v[pathData[k]];

        return true;
      } else if (typeof v[pathData[k]] === 'object') {
        return find(v[pathData[k]], f);
      }

      error = new ReferenceError(`Step ${this.name} has no valid next Step class at this.nextStep.${path.join('.')}`);
      return false;
    };

    find(this.nextStep, f);

    if (error && !val) {
      throw error;
    }

    return val;
  }

  * getRequest(req, res) {
    const { session } = req;

    // if flash object is set it means we are rendering this page following a post and there are errors
    // so find the errors and render the page
    if (session.flash && session.flash.errors) {
      // find the errors on the page
      const [, errors] = this.validate(session.flash.ctx, session);
      res.locals.errors = errors;

      //  map the context into data fields for use in templates and macros
      const fields = this.generateFields(session.flash.ctx, session);

      //  map the standard errors onto the fields
      res.locals.fields = this.mapErrorsToFields(errors, fields);

      //  remove any flash messages
      delete session.flash;
    }

    yield super.getRequest(req, res);
  }

  parseRequest(req) {
    return requestHandler.parse(this, req);
  }

  * postRequest(req, res) {
    let { session } = req;

    // clone session for applying stale data checks later
    const previousSession = cloneDeep(session);

    //  extract data from the request
    let ctx = this.populateWithPreExistingData(session);

    // get posted data
    // and merge ctx with posted data
    const postedData = this.parseRequest(req);
    Object.assign(ctx, postedData);

    //  intercept the request and process any incoming data
    //  here we can set data on the context before we validate
    //  eg, turn individual date fields (day, month, year) into a date
    ctx = yield this.interceptor(ctx, session);

    ctx = removeEmptyValues(ctx);

    //  then test whether the request is valid
    const [isValid] = this.validate(ctx, session);

    if (!req.headers['x-save-draft-session-only'] && isValid) {
      [ctx, session] = this.action(ctx, session);
      session = this.applyCtxToSession(ctx, session);
      session = staleDataManager.removeStaleData(previousSession, session);

      const nextStepUrl = this.next(ctx, session).url;
      res.redirect(nextStepUrl);
    }

    if (!req.headers['x-save-draft-session-only'] && !isValid) {
      // set the flash message
      session.flash = {
        errors: true,
        ctx
      };
      // redirect to the referrer - this prevents the form resubmission issue
      res.redirect(this.url);
    }

    yield super.postRequest(req, res);
  }

  uniqueProperties(schema) {
    if (schema.properties) {
      return schema.properties;
    }

    if (schema.oneOf) {
      const properties = reduce(schema.oneOf, (acc, s) => {
        Object.assign(acc, s.properties);
        return acc;
      }, {});

      return mapValues(properties, v => {
        return { type: v.type };
      });
    }

    throw new Error(`Step ${this.name} has an invalid schema: schema has no properties or oneOf keywords`);
  }

  validate(ctx, session) {
    let [isValid, errors] = [true, {}];

    if (ctx) {
      //    validate ctx against associated schema if there is one
      isValid = this.validateSchema(ctx);

      //    map the errors from the validator to the correct ones in the schema
      errors = isValid ? [] : this.mapErrors(this.validateSchema.errors, ctx, session);
    }

    return [isValid, errors];
  }

  mapErrors(unfilteredErrors, ctx, session) {
    const contentCtx = Object.assign({}, session, ctx, this.commonProps);
    const filteredErrors = filter(unfilteredErrors, error => {
      return error.keyword !== 'oneOf';
    });

    const errors = map(filteredErrors, error => {
      let param = '';
      let msg = '';
      let key = '';

      try {
        if (error.keyword === 'required' || error.keyword === 'switch') {
          param = error.params.missingProperty;
          key = `errors.${param}.required`;
          msg = this.i18next.t(key, contentCtx);
          if (msg === key) {
            throw new ReferenceError();
          }
        } else {
          [, param] = error.dataPath.split('.');
          key = `errors.${param}.invalid`;
          msg = this.i18next.t(key, contentCtx);
          if (msg === key) {
            throw new ReferenceError();
          }
        }

        return { param, msg };
      } catch (referenceError) {
        throw new ReferenceError(`Error messages have not been defined for Step ${this.name} in content.json for errors.${param}`);
      }
    });

    return uniqWith(errors, isEqual);
  }

  checkYourAnswersInterceptor(ctx/* , session*/) {
    return ctx;
  }

  get checkYourAnswersTemplate() {
    const path = `app/steps/${this.templatePath}/partials/checkYourAnswersTemplate.html`;
    if (fs.existsSync(path)) {
      return path;
    }
    return 'app/views/common/components/defaultCheckYouAnswersTemplate.html';
  }

  generateCheckYourAnswersContent(ctx = {}, session = {}, lang = 'en') {
    if (!this.content || !this.content.resources) {
      throw new ReferenceError(`Step ${this.name} has no content.json in it's resource folder`);
    }

    const contentCtx = Object.assign({}, session, ctx, this.commonProps);

    this.i18next.changeLanguage(lang);

    const translatedContent = this.content.resources.en.translation;

    return walkMap(translatedContent.checkYourAnswersContent, path => {
      return this.i18next.t(`checkYourAnswersContent.${path}`, contentCtx);
    });
  }
};
