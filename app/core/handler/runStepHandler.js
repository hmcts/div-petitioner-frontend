const co = require('co');
const { curry, get, reduce, cloneDeep } = require('lodash');
const { removeStaleData } = require('app/core/staleDataManager');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const statusCode = require('app/core/utils/statusCode');
const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const CONF = require('config');
const sessionBlacklistedAttributes = require('app/resources/sessionBlacklistedAttributes');

const authTokenString = '__auth-token';

const options = {
  draftBaseUrl: CONF.services.transformation.draftBaseUrl,
  baseUrl: CONF.services.transformation.baseUrl
};

const saveSessionToDraftPetitionStore = (req, session,
  saveAndResumeUrl, sendEmail) => {
  const production = process.env.NODE_ENV === 'production';
  const client = production ? transformationServiceClient.init(options) : mockedClient;

  // Properties that should be removed from the session before saving to draft store
  const sessionToSaveToDraftStore = sessionBlacklistedAttributes
    .reduce((acc, item) => {
      delete acc[item];
      return acc;
    }, Object.assign({}, session));

  // Get user token.
  let authToken = '';
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  if (saveAndResumeUrl) {
    sessionToSaveToDraftStore.saveAndResumeUrl = saveAndResumeUrl;
  }

  // attempt to save the current session to the draft store
  return client.saveToDraftStore(authToken,
    sessionToSaveToDraftStore, sendEmail)
    .catch(error => {
      logger.error(`Unable to save to draft store ${error}`);
      throw error;
    });
};

module.exports = curry((step, req, res) => {
  //  extract data from the request
  const stepData = step.parseRequest(req);

  return co(function* generator() { // eslint-disable-line complexity
    //  get the session
    let session = req.session;

    const previousSession = cloneDeep(session);

    //  fetch the ctx from the session
    //  this is the set of data scoped to the steps section
    //  the section is generated when the app starts up and
    //  is passed into the step when it is instantiated (app.js)
    //  we are cloning it here so as to not tamper with the session
    //  out of the flow of the rendering pipeline

    let ctx = {};

    // schemaScope is used for addresses
    if (step.schemaScope) {
      ctx = cloneDeep(get(session, step.schemaScope, {}));
    } else {
      const stepProperties = step.properties ? Object.keys(step.properties) : {};
      ctx = reduce(stepProperties, (context, key) => {
        context[key] = get(session, key);
        return context;
      }, {});
    }

    //  update the ctx with any new stepData sent from the client
    ctx = Object.assign(ctx, stepData);

    //  intercept the request and process any incoming data
    //  here we can set data on the context before we validate
    //  eg, turn individual date fields (day, month, year) into a date
    ctx = yield step.interceptor(ctx, session);

    if (req.method.toLowerCase() === 'post') {
      //  html forms post emtpy values as body.param = '', we need to strip these out
      //  of the data that we validate as json schema required fields
      //  expect the field to be absent
      ctx = reduce(ctx, (acc, v, k) => {
        if (v !== '') {
          acc[k] = v;
        }
        return acc;
      }, {});

      // if saving and closing do not validate data just save to session
      if (req.body.saveAndClose) {
        //  perform any actions dependent upon the step being in a valid state
        [ctx, session] = yield step.action(ctx, session);

        // schemaScope is used for addresses
        if (step.schemaScope) {
          session[step.schemaScope] = ctx;
        } else {
          Object.assign(session, ctx);
        }
        session = removeStaleData(previousSession, session);
        const sendEmail = true;
        saveSessionToDraftPetitionStore(req, session, step.url, sendEmail)
          .then(() => {
            res.redirect(step.steps.ExitApplicationSaved.url);
          })
          .catch(() => {
            res.redirect('/generic-error');
          });
      } else {
        //  then test whether the request is valid
        const [isValid, errors] = yield step.validate(ctx, session);

        if (isValid) {
          try {
            //  perform any actions dependent upon the step being in a valid state
            [ctx, session] = yield step.action(ctx, session);

            // schemaScope is used for addresses
            if (step.schemaScope) { // eslint-disable-line max-depth
              session[step.schemaScope] = ctx;
            } else {
              Object.assign(session, ctx);
            }

            session = removeStaleData(previousSession, session);
            saveSessionToDraftPetitionStore(req, session);
            res.redirect(step.next(ctx, session).url);
          } catch (error) {
            res.sendStatus(statusCode.INTERNAL_SERVER_ERROR);
          }
        } else if (process.env.NODE_ENV === 'testing') {
          // if running unit tests
          //  fetch all the content from the content files
          const content = yield step.generateContent(ctx, session);

          //  map the context into data fields for use in templates and macros
          let fields = yield step.generateFields(ctx, session);

          //  map the standard errors onto the fields
          fields = yield step.mapErrorsToFields(errors, fields);

          //  render the template
          res.render(step.template, { content, fields, errors, session });
        } else {
          // set the flash message
          session.flash = {
            errors: true,
            ctx
          };
          // redirect to the referer - this prevents the form resubmission issue
          res.redirect(step.url);
        }
      }
    } else {
      //  if we are not posting to the page
      //  we just want to render the page with the session for the page

      //  fetch all the content from the content files
      const content = yield step.generateContent(ctx, session);

      // if flash object is set it means we are rendering this page following a post and there are errors
      // so find the errors and render the page
      if (session.flash && session.flash.errors) {
        // find the errors on the page
        const [, errors] = yield step.validate(session.flash.ctx, session);

        //  map the context into data fields for use in templates and macros
        let fields = yield step.generateFields(session.flash.ctx, session);

        //  map the standard errors onto the fields
        fields = yield step.mapErrorsToFields(errors, fields);

        res.render(step.template, { content, fields, errors, session });

        //  remove any flash messages
        delete session.flash;
      } else {
        //  map the context into data fields for use in templates and macros
        const fields = yield step.generateFields(ctx, session);

        //  if we have been redirected to an error page, set the status as 500
        if (step.name === 'GenericError') {
          res.status(statusCode.INTERNAL_SERVER_ERROR);
        }

        res.render(step.template, { content, fields, session });
      }
    }
  }).catch(error => {
    logger.error(`Error in step handler: ${error}`);
    res.redirect('/generic-error');
  });
});
