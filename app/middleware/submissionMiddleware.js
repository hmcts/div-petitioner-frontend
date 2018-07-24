const logger = require('app/services/logger').logger(__filename);
const config = require('config');
const idam = require('app/services/idam');
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');

const hasSubmitted = function(req, res, next) {
  let authToken = '';
  let user = {};
  if (config.features.idam) {
    authToken = req.cookies['__auth-token'];

    const idamUserId = idam.userId(req);
    if (!idamUserId) {
      logger.error('User does not have any idam userDetails', req);
      res.redirect('/generic-error');
      return;
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
        // Initialise services.
        const serviceToken = serviceTokenService.setup();
        const payment = paymentService.setup();
        const submission = submissionService.setup();

        // Get service token.
        serviceToken.getToken()
        // Query payment status.
          .then(token => {
            return payment.query(user, token, session.currentPaymentReference,
              session.mockedPaymentOutcome);
          })

          // Store status in session then update CCD with payment status.
          .then(response => {
            logger.info({
              message: 'Payment status query response:',
              response
            });

            const id = session.currentPaymentId;
            session.payments[id] = Object.assign({}, session.payments[id],
              response);

            const paymentSuccess = paymentService.isPaymentSuccessful(response);

            if (paymentSuccess) {
              const eventData = submissionService
                .generatePaymentEventData(session, response);
              return submission.update(authToken, session.caseId, eventData, 'paymentMade');
            }
            return res.redirect('/application-submitted');
          })

          // Log any errors occurred and end up on the error page.
          .catch(error => {
            const msg = (error instanceof Error) ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : JSON.stringify(error);
            logger.error(msg, req);
            return res.redirect('/generic-error');
          });
      } else {
        res.redirect('/application-submitted');
      }
      break;
    case 'Rejected':
      next();
      break;
    default:
      res.redirect('/application-submitted-awaiting-response');
      break;
    }
  } else {
    next();
  }
};

module.exports = { hasSubmitted };