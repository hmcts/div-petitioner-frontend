const logger = require('app/services/logger').logger(__filename);
const config = require('config');
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');
const parseBool = require('app/core/utils/parseBool');

const APPLICATION_SUBMITTED_PATH = '/application-submitted';
const APPLICATION_AWAITING_RESPONSE_PATH = '/application-submitted-awaiting-response';

const hasSubmitted = function(req, res, next) {
  const { session } = req;
  const hasSubmittedEnabled = true;

  logger.info(`DIV-2815-LOG SESSION hS>>>${JSON.stringify(session)}`);
  logger.info(`DIV-2815-LOG hasSubmittedEnabled >>> ${hasSubmittedEnabled}`);
  logger.info(`DIV-2815-LOG currentPaymentReference >>> ${session.currentPaymentReference}`);
  if (hasSubmittedEnabled && session.caseId && session.state) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      if (session.currentPaymentReference) {
        return paymentStatusService
          .checkAndUpdatePaymentStatus(req)
          .then(response => {
            if (response !== true) return APPLICATION_AWAITING_RESPONSE_PATH;
            return APPLICATION_SUBMITTED_PATH;
          })
          .then(
            url => {
              return res.redirect(url);
            }
          )
          // Log any errors occurred and end up on the error page.
          .catch(error => {
            const msg = (error instanceof Error) ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : JSON.stringify(error);
            logger.error(msg, req);
            return res.redirect('/generic-error');
          });
      }
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
