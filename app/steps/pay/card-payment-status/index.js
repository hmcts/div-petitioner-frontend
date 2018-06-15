const logger = require('app/services/logger').logger(__filename);
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const idam = require('app/services/idam');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');

const Step = require('app/core/steps/Step');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const serviceTokenService = require('app/services/serviceToken');
const paymentService = require('app/services/payment');
const submissionService = require('app/services/submission');

module.exports = class CardPaymentStatus extends Step {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      restoreFromDraftStore,
      setIdamUserDetails
    ];
  }

  handler(req, res, next) {
    // @todo Fail early if paymentId cannot be found in the session.
    // @todo Fail early if request is not in the right format.

    req.session = req.session || {};
    req.session.payments = req.session.payments || {};

    // Return early when the status of the currently stored payment is already retrieved.
    const resultInSession = paymentService.getCurrentPaymentStatus(req.session);
    if (resultInSession === 'success' || resultInSession === 'failed') {
      res.redirect(this.next(resultInSession).url);
      next();
      return;
    }

    // User prerequisites. @todo extract these elsewhere?
    let authToken = '';
    let user = {};

    if (features.idam) {
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

    const caseId = req.session.caseId;

    // Initialise services.
    const serviceToken = serviceTokenService.setup();
    const payment = paymentService.setup();
    const submission = submissionService.setup();

    // Get service token.
    serviceToken.getToken()
      // Query payment status.
      .then(token => {
        return payment.query(user, token, req.session.currentPaymentReference,
          req.session.mockedPaymentOutcome);
      })

      // Store status in session then update CCD with payment status.
      .then(response => {
        logger.info({
          message: 'Payment status query response:',
          response
        });

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
          logger.info({
            message: 'Transformation service update response:',
            response
          });

          if (!response || response.status !== 'success') {
            // Fail immediately if the application could not be updated in CCD.
            throw response;
          }
        }

        const id = req.session.currentPaymentId;
        const paymentStatus = req.session.payments[id].status;
        res.redirect(this.next(paymentStatus).url);
        next();
      })

      // Log any errors occurred and end up on the error page.
      .catch(error => {
        const msg = (error instanceof Error) ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : JSON.stringify(error);
        logger.error(msg, req);
        res.redirect('/generic-error');
      });
  }

  get url() {
    return '/pay/card-payment-status';
  }

  get nextStep() {
    return {
      nextStep: {
        DoneAndSubmitted: this.steps.DoneAndSubmitted,
        PayOnline: this.steps.PayOnline
      }
    };
  }

  next(result) {
    return (result.toLowerCase() === 'success') ? this.steps.DoneAndSubmitted : this.steps.PayOnline;
  }
};
