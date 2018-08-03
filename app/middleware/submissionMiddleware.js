const logger = require('app/services/logger').logger(__filename);
const config = require('config');
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');

const hasSubmitted = function(req, res, next) {
  const { session } = req;
  const hasSubmittedEnabled = ['prod'].includes(config.deployment_env);
  if (hasSubmittedEnabled && !this.enabledAfterSubmission && session.caseId && session.state) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      if (session.currentPaymentReference) {
        return paymentStatusService
          .checkAndUpdatePaymentStatus(req)
          .then(response => {
            if (response !== true) return '/application-submitted-awaiting-response';
            return '/application-submitted';
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
      return res.redirect('/application-submitted');
    case 'Rejected':
      return next();
    default:
      return res.redirect('/application-submitted-awaiting-response');
    }
  }
  return next();
};

module.exports = { hasSubmitted };
