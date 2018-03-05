const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class PayByPhoneCourt extends ValidationStep {
  get enabledAfterSubmission() {
    return true;
  }

  get url() {
    return '/pay/card-over-phone-court';
  }

  get nextStep() {
    return this.steps.CheckYourAnswers;
  }

  constructor(...args) {
    super(...args);

    watch('paymentMethod', (previousSession, session, remove) => {
      remove('paymentTimeToCall', 'paymentPhoneNumber');
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  interceptor(ctx, session) {
    if (session.petitionerPhoneNumber && !ctx.paymentPhoneNumber) {
      ctx.paymentPhoneNumber = session.petitionerPhoneNumber || '';
    }
    return ctx;
  }
};
