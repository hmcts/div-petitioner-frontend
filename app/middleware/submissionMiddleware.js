const config = require('config');
const parseBool = require('app/core/utils/parseBool');

const APPLICATION_SUBMITTED_PATH = '/application-submitted';
const APPLICATION_AWAITING_RESPONSE_PATH = '/application-submitted-awaiting-response';

const hasSubmitted = function(req, res, next) {
  const session = req.session;

  const hasSubmittedEnabled = ['prod'].includes(config.deployment_env);

  // when an existing case is found and we have the state
  if (hasSubmittedEnabled && session.caseId && session.state) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      return res.redirect(APPLICATION_SUBMITTED_PATH);
    case 'Rejected':
      return next();
    default:
      return res.redirect(APPLICATION_AWAITING_RESPONSE_PATH);
    }
  }

  // when a new case has just been submitted for the session
  if (parseBool(config.features.redirectToApplicationSubmitted) && session.caseId) { // eslint-line-disable
    return res.redirect(APPLICATION_SUBMITTED_PATH);
  }

  return next();
};

module.exports = { hasSubmitted };
