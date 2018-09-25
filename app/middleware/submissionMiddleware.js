const logger = require('app/services/logger').logger(__filename);
const config = require('config');
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');
const parseBool = require('app/core/utils/parseBool');

const APPLICATION_SUBMITTED_PATH = '/application-submitted';
const APPLICATION_AWAITING_RESPONSE_PATH = '/application-submitted-awaiting-response';
const APPLICATION_MULTIPLE_REJECTED_CASES_PATH = '/contact-divorce-team';

const handleCcdCase = (req, res, next) => {
  const session = req.session;
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
  case 'MultipleRejectedCases':
    return res.redirect(APPLICATION_MULTIPLE_REJECTED_CASES_PATH);
  default:
    return res.redirect(APPLICATION_AWAITING_RESPONSE_PATH);
  }
};

const hasSubmitted = function(req, res, next) {
  const { session } = req;
  const hasSubmittedEnabled = true;

  logger.info(`DIV-2815-LOG SESSION sm>>>${JSON.stringify(session)}`);
  logger.info(`DIV-2815-LOG SESSION sm session.cookie>>>${JSON.stringify(session.cookie)}`);
  logger.info(`DIV-2815-LOG SESSION sm req.cookies >>>${JSON.stringify(req.cookies)}`);
  logger.info(`DIV-2815-LOG payment_reference >>> ${session.payment_reference}`);
  logger.info(`DIV-2815-LOG hasSubmittedEnabled >>> ${hasSubmittedEnabled}`);
  logger.info(`DIV-2815-LOG currentPaymentReference >>> ${session.currentPaymentReference}`);
  if (session.payment_reference) session.currentPaymentReference = session.payment_reference;
  logger.info(`DIV-2815-LOG currentPaymentReference v2 >>> ${session.currentPaymentReference}`);
  if (hasSubmittedEnabled && session.caseId && session.state) { // eslint-disable-line
    return handleCcdCase(req, res, next);
  }
  // when a new case has just been submitted for the session
  if (parseBool(config.features.redirectToApplicationSubmitted) && session.caseId) { // eslint-line-disable
    return res.redirect(APPLICATION_SUBMITTED_PATH);
  }

  return next();
};

module.exports = { hasSubmitted };
