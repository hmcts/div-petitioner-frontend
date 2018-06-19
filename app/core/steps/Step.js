/* eslint-disable getter-return, no-empty-function */
const { forEach, mapValues, get, reduce } = require('lodash');
const i18next = require('i18next');
const CONF = require('config');
const { Router } = require('express');
const walkMap = require('app/core/utils/treeWalker');
const statusCodes = require('http-status-codes');
const co = require('co');
const logger = require('app/services/logger').logger(__filename);

const defualtNext = () => {};

// used to stop the middleware chain,
// otherwise it will continue and trigger a 404 page not found
const killMiddlewareChain = () => {};

module.exports = class Step {
  get ignorePa11yErrors() {
    return [];
  }
  get ignorePa11yWarnings() {
    return [];
  }
  get urlToBind() {
    return this.url;
  }
  get url() {
    return null;
  }
  get name() {
    return this.constructor.name;
  }
  get commonProps() {
    return CONF.commonProps;
  }
  get template() {
    return this.templatePath ? `${this.templatePath}/template` : null;
  }
  get fields() {
    return [];
  }
  get nextStep() {
    return null;
  }

  next() {
    return this.nextStep;
  }

  constructor(steps, section = null, templatePath, content = {}) {
    this.steps = steps;
    this.section = section;
    this.templatePath = templatePath;
    this.content = JSON.parse(JSON.stringify(content));
    this.i18next = i18next.createInstance();
    this.i18next.init(this.content, error => {
      if (error) {
        process.emit('applicaton-log', {
          level: 'ERROR',
          message: 'divorce-application-i18n. Failed to initialise i18next',
          fields: {
            step: this.name,
            error: error.message
          }
        });
      }
    });
  }


  applyCtxToSession(ctx, session) {
    Object.assign(session, ctx);
    return session;
  }

  populateWithPreExistingData(session = {}) {
    const stepProperties = this.properties ? Object.keys(this.properties) : {};
    const ctx = reduce(stepProperties, (context, key) => {
      context[key] = get(session, key);
      return context;
    }, {});
    return ctx;
  }

  interceptor(ctx, session) { // eslint-disable-line no-unused-vars
    return ctx;
  }

  validate(/* ctx, session*/) {
    return [true, []];
  }

  generateContent(ctx, session, lang = 'en') {
    if (!this.content || !this.content.resources) {
      throw new ReferenceError(`Step ${this.name} has no content.json in it's resource folder`);
    }

    const contentCtx = Object.assign({}, session, ctx, this.commonProps);

    this.i18next.changeLanguage(lang);

    return walkMap(this.content.resources.en.translation.content, path => {
      return this.i18next.t(`content.${path}`, contentCtx);
    });
  }

  generateFields(ctx, session) { // eslint-disable-line no-unused-vars
    return mapValues(ctx, v => {
      return { value: v, error: false };
    });
  }

  mapErrorsToFields(errors = [], fields) {
    forEach(errors, error => {
      //  we may be generating errors for data we've created in #interceptor
      //  which won't get created in generate fields as it's based upon
      //  the incoming ctx
      if (!fields[error.param]) {
        fields[error.param] = {};
      }

      fields[error.param].error = true;
      fields[error.param].errorMessage = error.msg;
    });

    return fields;
  }

  action(ctx, session) {
    return [ctx, session];
  }

  get middleware() {
    return [];
  }

  get postMiddleware() {
    return [];
  }

  preResponse(req, res) { // eslint-disable-line no-unused-vars
    return Promise.resolve();
  }

  * getRequest(req, res) {
    const { session } = req;

    //  extract data from the request
    let ctx = this.populateWithPreExistingData(session);

    //  intercept the request and process any incoming data
    //  here we can set data on the context before we validate
    //  eg, turn individual date fields (day, month, year) into a date
    ctx = yield this.interceptor(ctx, session);

    // let errors = null;
    // let fields = null;
    //  fetch all the content from the content files
    res.locals.content = this.generateContent(ctx, session);

    if (!res.locals.fields) {
      //  map the context into data fields for use in templates and macros
      res.locals.fields = this.generateFields(ctx);
    }

    res.locals.session = session;

    yield this.preResponse(req, res);

    res.render(this.template);
  }

  postRequest(req, res) {
    if (!res.headersSent && !req.headers['x-save-draft-session-only']) {
      res.sendStatus(statusCodes.METHOD_NOT_ALLOWED);
    }

    return Promise.resolve();
  }

  handler(req, res, next = defualtNext) {
    const method = req.method.toLowerCase();
    const throwError = error => {
      logger.error(error);
      res.status(statusCodes.INTERNAL_SERVER_ERROR);
      res.redirect('/generic-error');
    };

    switch (method) {
    case 'post':
      co(this.postRequest(req, res))
        .then(next)
        .catch(throwError);
      break;
    case 'get':
    default:
      co(this.getRequest(req, res))
        .then(next)
        .catch(throwError);
    }
  }

  get router() {
    if (!this._router && this.urlToBind) {
      this._router = Router();
      this.middleware.forEach(middleware => {
        this._router.use(this.urlToBind, middleware.bind(this));
      });
      this._router.use(this.urlToBind, this.handler.bind(this));
      this.postMiddleware.forEach(middleware => {
        this._router.use(this.urlToBind, middleware.bind(this));
      });
      this._router.use(this.urlToBind, killMiddlewareChain);
    }

    return this._router || null;
  }
};
