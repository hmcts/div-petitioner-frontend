const ValidationStep = require('app/core/steps/ValidationStep');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

module.exports = class GovPayStub extends ValidationStep {
  get enabledAfterSubmission() {
    return true;
  }

  get url() {
    return '/pay/gov-pay-stub';
  }

  next() {
    return this.steps.CardPaymentStatus;
  }

  // Disable check your answers.
  get checkYourAnswersTemplate() {
    return false;
  }

  handler(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('Payment stub page requested in production mode');
      return res.redirect('/errors/404');
    }

    return super.handler(req, res, next);
  }

  action(ctx, session) {
    return [
      { mockedPaymentOutcome: (ctx.mockedOutcome === 'success') },
      session
    ];
  }
};
