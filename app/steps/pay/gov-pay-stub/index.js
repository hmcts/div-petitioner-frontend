const ValidationStep = require('app/core/steps/ValidationStep');
const logger = require('app/services/logger').logger(__filename);
const CONF = require('config');

module.exports = class GovPayStub extends ValidationStep {
  get url() {
    return '/pay/gov-pay-stub';
  }

  get nextStep() {
    return this.steps.CardPaymentStatus;
  }

  // Disable check your answers.
  get checkYourAnswersTemplate() {
    return false;
  }

  handler(req, res, next) {
    if (CONF.environment === 'production') {
      logger.error('Payment stub page requested in production mode', req);
      return this.steps.Error404.handler(req, res, next);
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
