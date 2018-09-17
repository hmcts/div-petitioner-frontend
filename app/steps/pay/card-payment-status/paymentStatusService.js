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
  logger.info(`DIV-2815-LOG cpstatus session  >>> ${req.session}`);
  const user = buildUser(req);
  const session = req.session;
  // Initialise services.
  const serviceToken = serviceTokenService.setup();
  const payment = paymentService.setup();
  const submission = submissionService.setup();

  logger.info(`DIV-2815-LOG cpstatus token >>> ${req.session}`);
  // Get service token.
  return serviceToken.getToken()
  // Query payment status.
    .then(token => {
      logger.info(`DIV-2815-LOG cpstatus token get  >>> ${token}`);
      return payment.query(user, token, session.currentPaymentReference,
        session.mockedPaymentOutcome);
    })

    // Store status in session then update CCD with payment status.
    .then(response => {
      logger.info(`DIV-2815-LOG cpstatus status response  >>> ${response}`);
      logger.info({
        message: 'Payment status query response:',
        response
      });
      const paymentId = session.currentPaymentId;
      session.payments = session.payments || {};
      session.payments[paymentId] = Object.assign({},
        session.payments[paymentId], response);

      logger.info(`DIV-2815-LOG cpstatus payment set  >>> ${session.payments[paymentId]}`);
      const paymentSuccess = paymentService.isPaymentSuccessful(response);
      logger.info({ message: 'paymentSuccess:', paymentSuccess });
      if (paymentSuccess) {
        logger.info({ message: 'DIV-2815-LOG cpstatus paymentSuccess' });
        const eventData = submissionService
          .generatePaymentEventData(session, response);
        logger.info({ message: 'DIV-2815-LOG cpstatus event generated' });
        return submission.update(user.authToken, session.caseId, eventData, 'paymentMade');
      }

      return new Promise(resolve => {
        resolve(true);
      });
    })
    .then(responseStatus => {
      if (responseStatus !== true) {
        logger.info({
          message: 'Transformation service update response:',
          responseStatus
        });

        if (!responseStatus || responseStatus.status !== 'success') {
          // Fail immediately if the application could not be updated in CCD.
          throw responseStatus;
        }
      }
      return responseStatus;
    });
};

module.exports = { checkAndUpdatePaymentStatus };