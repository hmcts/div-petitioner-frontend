const logger = require('app/services/logger').logger(__filename);
const config = require('config');
const idam = require('app/services/idam');
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');

const hasSubmitted = function(req, res, next) {
  let authToken = '';
  let user = {};
  if (config.features.idam) {
    authToken = req.cookies['__auth-token'];

    const idamUserId = idam.userId(req);
    if (!idamUserId) {
      logger.error('User does not have any idam userDetails', req);
      return res.redirect('/generic-error');
    }

    user = {
      id: idamUserId,
      bearerToken: authToken
    };
  }

  const { session } = req;

  const hasSubmittedEnabled = ['prod'].includes(config.deployment_env);

  if (hasSubmittedEnabled && !this.enabledAfterSubmission && session.caseId) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      if (session.currentPaymentReference) {
        return paymentStatusService
          .checkAndUpdatePaymentStatus(res, user, authToken, session)
          .then(response => {
            if (response !== true) return '/application-submitted-awaiting-response';
            return '/application-submitted';
          })
          // Log any errors occurred and end up on the error page.
          .catch(error => {
            const msg = (error instanceof Error) ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : JSON.stringify(error);
            logger.error(msg, req);
            return '/generic-error';
          })
          .then(
            url => {
              return res.redirect(url);
            }
          );
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
