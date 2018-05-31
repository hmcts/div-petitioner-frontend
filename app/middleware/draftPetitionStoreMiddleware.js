const CONF = require('config');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const httpStatus = require('http-status-codes');
const { isEmpty } = require('lodash');

// Properties that should be removed from the session before saving to draft store
const blacklistedProperties = [
  'expires',
  'cookie',
  'sessionKey',
  'saveAndResumeUrl',
  'csrfSecret'
];

const options = {
  draftBaseUrl: CONF.services.transformation.draftBaseUrl,
  baseUrl: CONF.services.transformation.baseUrl
};
const production = process.env.NODE_ENV === 'production';
const client = production ? transformationServiceClient.init(options) : mockedClient;

const checkYourAnswers = '/check-your-answers';
const authTokenString = '__auth-token';

const redirectToCheckYourAnswers = (req, res, next) => {
  const isCheckYourAnswers = req.originalUrl === checkYourAnswers;

  if (isCheckYourAnswers) {
    next();
  } else {
    res.redirect(checkYourAnswers);
  }
};

const restoreFromDraftStore = (req, res, next) => {
  // Get user token.
  let authToken = false;
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  // test to see if we have already restored draft store
  const hadFetchedFromDraftStore = req.session && req.session.hasOwnProperty('fetchedDraft');
  const mockResponse = req.cookies.mockRestoreSession === 'true';
  const restoreSession = !hadFetchedFromDraftStore && (mockResponse || authToken);

  if (!restoreSession) {
    return next();
  }

  // set flag so we do not attempt to restore from draft store again
  req.session.fetchedDraft = true;

  // attempt to restore session from draft petition store
  return client.restoreFromDraftStore(authToken, mockResponse)
    .then(restoredSession => {
      if (restoredSession && !isEmpty(restoredSession)) {
        logger.error('Restored session');
        logger.error(JSON.stringify(restoredSession));
        Object.assign(req.session, restoredSession);

        redirectToCheckYourAnswers(req, res, next);
      } else {
        next();
      }
    })
    .catch(error => {
      if (error.statusCode !== httpStatus.NOT_FOUND) {
        logger.error(`Error when attempting to restore session from draft store ${error}`);
      }
      next();
    });
};

const removeFromDraftStore = (req, res, next) => {
  let authToken = false;
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  return client.removeFromDraftStore(authToken)
    .then(next)
    .catch(error => {
      if (error.statusCode !== httpStatus.NOT_FOUND) {
        logger.error(`Error when attempting to restore session from draft store ${error}`);
        return res.redirect('/generic-error');
      }
      return next();
    });
};

const removeBlackListedPropertiesFromSession = session => {
  return blacklistedProperties
    .reduce((acc, item) => {
      delete acc[item];
      return acc;
    }, Object.assign({}, session));
};


const saveSessionToDraftStore = (req, res, next) => {
  const { session, method } = req;

  const hasErrors = session.flash && session.flash.errors;
  const isPost = method.toLowerCase() === 'post';

  if (hasErrors || !isPost) {
    return next();
  }

  const sessionToSave = removeBlackListedPropertiesFromSession(session);

  // Get user token.
  let authToken = '';
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  // attempt to save the current session to the draft store
  return client.saveToDraftStore(authToken, sessionToSave)
    .then(() => {
      next();
    })
    .catch(error => {
      logger.error(`Unable to save to draft store ${error}`);
      next();
    });
};

// use `function` instead of `arrow function (=>)` to preserve scope set in step.js #router
// this. refers to Step class or inheritance of (app/core/steps/Step)
const saveSessionToDraftStoreAndClose = function(req, res, next) {
  const { method, body } = req;

  const isPost = method.toLowerCase() === 'post';
  const hasSaveAndCloseBody = body && body.saveAndClose;

  if (isPost && hasSaveAndCloseBody) {
    const ctx = this.parseRequest(req); // eslint-disable-line no-invalid-this
    const session = this.applyCtxToSession(ctx, req.session); // eslint-disable-line no-invalid-this
    const sessionToSave = removeBlackListedPropertiesFromSession(session);

    // Get user token.
    let authToken = '';
    if (req.cookies && req.cookies[authTokenString]) {
      authToken = req.cookies[authTokenString];
    }

    const sendEmail = true;
    client.saveToDraftStore(authToken, sessionToSave, sendEmail)
      .then(() => {
        res.redirect(this.steps.ExitApplicationSaved.url); // eslint-disable-line no-invalid-this
      })
      .catch(error => {
        logger.error(`Unable to save to draft store ${error}`);
        res.redirect('/generic-error');
      });
  } else {
    next();
  }
};

module.exports = {
  restoreFromDraftStore,
  removeFromDraftStore,
  redirectToCheckYourAnswers,
  saveSessionToDraftStoreAndClose,
  saveSessionToDraftStore
};
