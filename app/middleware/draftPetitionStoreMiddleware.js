const CONF = require('config');
const logger = require('app/services/logger').logger(__filename);
const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const parseRequest = require('app/core/helpers/parseRequest');
const httpStatus = require('http-status-codes');
const { isEmpty } = require('lodash');
const stepsHelper = require('app/core/helpers/steps');
const co = require('co');

// Properties that should be removed from the session before saving to draft store
const blacklistedProperties = [
  'expires',
  'cookie',
  'sessionKey',
  'saveAndResumeUrl',
  'submissionStarted',
  'csrfSecret'
];

const options = {
  draftBaseUrl: CONF.services.transformation.draftBaseUrl,
  baseUrl: CONF.services.transformation.baseUrl
};

const production = CONF.environment === 'production';
const client = production ? transformationServiceClient.init(options) : mockedClient;
const authTokenString = '__auth-token';

const redirectToCheckYourAnswers = (req, res, next) => {
  const CheckYourAnswersStep = res.locals.steps.CheckYourAnswers;

  const alreadyOnCYAStep = req.originalUrl === CheckYourAnswersStep.url;
  if (alreadyOnCYAStep) {
    return next();
  }

  return res.redirect(CheckYourAnswersStep.url);
};

const redirectToNextUnansweredQuestion = function* (req, res, next) {
  const { steps } = res.locals;
  const { session } = req;
  const UnAnsweredStep = yield stepsHelper
    .findNextUnAnsweredStep(steps.Index, session);

  const alreadyOnCurrentStep = req.originalUrl === UnAnsweredStep.url;
  if (alreadyOnCurrentStep) {
    return next();
  }

  return res.redirect(UnAnsweredStep.url);
};

const redirectToNextPage = (req, res, next) => {
  const { session } = req;

  if (session.hasOwnProperty('previousCaseId')) {
    return co(redirectToNextUnansweredQuestion(req, res, next))
      .catch(error => {
        logger.errorWithReq(req, 'redirect_to_next_unanswered_step_error', 'Error finding and redirecting to next step', error.message);
        return redirectToCheckYourAnswers(req, res, next);
      });
  }

  return redirectToCheckYourAnswers(req, res, next);
};

const removeBlackListedPropertiesFromSession = session => {
  return blacklistedProperties
    .reduce((acc, item) => {
      delete acc[item];
      return acc;
    }, Object.assign({}, session));
};

const restoreFromDraftStore = (req, res, next) => {
  // Get user token.
  let authToken = false;
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  } else if (req.query && req.query[authTokenString]) {
    authToken = req.query[authTokenString];
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
    .then(draftStoreResponse => {
      if (isEmpty(draftStoreResponse)) {
        return next();
      }

      Object.assign(
        req.session,
        removeBlackListedPropertiesFromSession(draftStoreResponse)
      );

      return redirectToNextPage(req, res, next);
    })
    .catch(error => {
      if (error.statusCode !== httpStatus.NOT_FOUND) {
        logger.errorWithReq(req, 'restore_draft_error', 'Error restoring draft', error.message);
      }
      next();
    });
};

const removeFromDraftStore = (req, res, next) => {
  let authToken = false;
  logger.infoWithReq(req, 'remove_draft_attempt', 'Attempting to remove draft');
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  return client.removeFromDraftStore(authToken)
    .then(() => {
      logger.infoWithReq(req, 'remove_draft_done', 'Successfully removed draft');
      next();
    })
    .catch(error => {
      logger.errorWithReq(req, 'remove_draft_error', 'Error removing draft', error.message);
      return res.redirect('/generic-error');
    });
};

const saveSessionToDraftStore = (req, res, next) => {
  const { session, method } = req;
  const hasErrors = session.flash && session.flash.errors;
  const isPost = method.toLowerCase() === 'post';

  if (hasErrors || !isPost || req.headers['x-save-draft-session-only']) {
    return next();
  }

  const sessionToSave = removeBlackListedPropertiesFromSession(session);

  // Get user token.
  let authToken = '';
  if (req.cookies && req.cookies[authTokenString]) {
    authToken = req.cookies[authTokenString];
  }

  return client.saveToDraftStore(authToken, sessionToSave)
    .then(() => {
      next();
    })
    .catch(error => {
      logger.errorWithReq(req, 'save_draft_error', 'Error saving draft', error.message);
      next();
    });
};

const saveSessionToDraftStoreAndReply = function(req, res, next) {
  if (req.headers['x-save-draft-session-only']) {
    const authToken = req.cookies[authTokenString] || '';
    // eslint-disable-next-line no-invalid-this
    Object.assign(req.session, parseRequest.parse(this, req));
    const session = removeBlackListedPropertiesFromSession(req.session);

    return client
      .saveToDraftStore(authToken, session)
      .then(() => {
        res
          .status(httpStatus.OK)
          .json({ message: 'ok' });
      })
      .catch(error => {
        logger.errorWithReq(req, 'save_draft_and_reply_error', 'Error saving draft and reply', error.message);
        res
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error saving session to draft store' });
      });
  }

  return next();
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
        logger.errorWithReq(req, 'save_draft_and_close_error', 'Error restoring draft', error.message);
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
  saveSessionToDraftStore,
  saveSessionToDraftStoreAndReply,
  redirectToNextUnansweredQuestion,
  redirectToNextPage
};
