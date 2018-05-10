const CONF = require('config');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);
const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const httpStatus = require('http-status-codes');
const { isEmpty } = require('lodash');

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

module.exports = {
  restoreFromDraftStore,
  removeFromDraftStore,
  redirectToCheckYourAnswers
};
