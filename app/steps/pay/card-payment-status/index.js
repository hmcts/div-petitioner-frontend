const jwt = require('jsonwebtoken');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const statusCodes = require('http-status-codes');

const Step = require('app/core/Step');
const { protect } = require('app/services/idam');
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');

module.exports = class CardPaymentStatus extends Step {
  get middleware() {
    const idamProtect = (req, res, next) => {
      return features.idam ? protect()(req, res, next) : next();
    };

    return [idamProtect];
  }

  handler(req, res) {
    // This step does not exist if online submission is not enabled.
    if (!features.onlineSubmission) {
      res.status(statusCodes.NOT_FOUND).send('Not Found');
      return;
    }

    // @todo Fail early if paymentId cannot be found in the session.
    // @todo Fail early if request is not in the right format.

    req.session = req.session || {};
    req.session.payments = req.session.payments || {};

    // Return early when the status of the currently stored payment is already retrieved.
    const resultInSession = paymentService.getCurrentPaymentStatus(req.session);
    if (resultInSession && resultInSession.finished) {
      res.redirect(this.next(resultInSession).url);
      return;
    }

    // User prerequisites. @todo extract these elsewhere?
    let authToken = '';
    let user = {};

    if (features.idam) {
      authToken = req.cookies['__auth-token'];
      user = {
        id: jwt.decode(authToken).id,
        bearerToken: authToken
      };
    }
    const caseId = req.session.caseId;

    // Initialise services.
    const serviceToken = serviceTokenService.setup();
    const payment = paymentService.setup();
    const submission = submissionService.setup();

    // Get service token.
    serviceToken.getToken()
      // Query payment status.
      .then(token => {
        return payment.query(user, token, req.session.currentPaymentId,
          req.session.mockedPaymentOutcome);
      })

      // Store status in session then update CCD with payment status.
      .then(response => {
        logger.info(`Payment status query response: ${JSON.stringify(response)}`);
        const id = req.session.currentPaymentId;
        req.session.payments[id] = Object.assign({}, req.session.payments[id],
          response);

        const paymentSuccess = paymentService.isPaymentSuccessful(response);

        if (paymentSuccess) {
          const eventData = submissionService
            .generatePaymentEventData(req.session, response);

          return submission.update(authToken, caseId, eventData, 'paymentMade');
        }

        return true;
      })

      // Check CCD update response then redirect to a step based on payment status.
      .then(response => {
        if (response !== true) {
          logger.info(`Transformation service update response: ${JSON.stringify(response)}`);
          if (!response || response.status !== 'success') {
            // Fail immediately if the application could not be updated in CCD.
            throw response;
          }
        }

        const id = req.session.currentPaymentId;
        const paymentState = req.session.payments[id].state;
        res.redirect(this.next(paymentState).url);
      })

      // Log any errors occurred and end up on the error page.
      .catch(error => {
        const msg = (error instanceof Error) ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : JSON.stringify(error);
        logger.error(msg);
        res.redirect('/generic-error');
      });
  }

  get url() {
    return '/pay/card-payment-status';
  }

  next(result) {
    return (result.status === 'success' && result.finished === true) ? this.steps.DoneAndSubmitted : this.steps.PayOnline;
  }
};
