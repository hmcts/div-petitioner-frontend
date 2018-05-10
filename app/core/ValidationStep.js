const { filter, isEqual, map, mapValues, reduce, uniqWith } = require('lodash');
const Ajv = require('ajv');
const Step = require('./Step');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const fs = require('fs');

const ajv = new Ajv({ allErrors: true, v5: true });

module.exports = class ValidationStep extends Step {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      restoreFromDraftStore,
      setIdamUserDetails,
      hasSubmitted
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
};
