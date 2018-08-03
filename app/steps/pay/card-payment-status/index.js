const logger = require('app/services/logger').logger(__filename);
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');

const Step = require('app/core/steps/Step');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const paymentService = require('app/services/payment');
const paymentStatusService = require('app/steps/pay/card-payment-status/paymentStatusService');

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
    paymentStatusService
      .checkAndUpdatePaymentStatus(req)
      // Check CCD update response then redirect to a step based on payment status.
      .then(response => {
        logger.info({
          message: 'update paymentStatus',
          response
        });
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
