const logger = require('app/services/logger').logger(__filename);
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');
const CONF = require('config');
const idam = require('app/services/idam');

const buildUser = function(req) {
  let authToken = '';
  let user = {};

  if (CONF.features.idam) {
    authToken = req.cookies['__auth-token'];

    const idamUserId = idam.userId(req);
    if (!idamUserId) {
      throw new Error('User does not have any idam userDetails');
    }

    user = {
      id: idamUserId,
      bearerToken: authToken
    };
  }
  return user;
};

const checkAndUpdatePaymentStatus = function(req) { // eslint-disable-line
  const user = buildUser(req);
  const session = req.session;
  // Initialise services.
  const serviceToken = serviceTokenService.setup();
  const payment = paymentService.setup();
  const submission = submissionService.setup();

  // Get service token.
  return serviceToken.getToken()
  // Query payment status.
    .then(token => {
      return payment.query(user, token, session.currentPaymentReference,
        session.mockedPaymentOutcome);
    })

    // Store status in session then update CCD with payment status.
    .then(response => {
      logger.info(`Payment status query response: ${response}`);
      const paymentId = session.currentPaymentId;
      session.payments = session.payments || {};
      session.payments[paymentId] = Object.assign({},
        session.payments[paymentId], response);

      const paymentSuccess = paymentService.isPaymentSuccessful(response);
      logger.info(`paymentSuccess: ${paymentSuccess}`);
      if (paymentSuccess) {
        const eventData = submissionService
          .generatePaymentEventData(session, response);
        return submission.update(user.bearerToken, session.caseId, eventData, 'paymentMade');
      }

      return new Promise(resolve => {
        resolve(true);
      });
    })
    .then(responseStatus => {
      if (responseStatus !== true) {
        logger.info(`Transformation service update response: ${responseStatus}`);
        if (!responseStatus || responseStatus.status !== 'success') {
          // Fail immediately if the application could not be updated in CCD.
          throw responseStatus;
        }
      }
      return responseStatus;
    });
};

module.exports = { checkAndUpdatePaymentStatus };