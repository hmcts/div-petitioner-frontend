const statusCodes = require('http-status-codes');
const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

module.exports = class GovPayStub extends OptionStep {
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

  handler(req, res) {
    if (process.env.NODE_ENV === 'production') {
      // Fail early.
      logger.error(new Error('Payment stub page requested in production mode'));
      return res.status(statusCodes.NOT_FOUND).send('Not found');
    }

    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    return [
      { mockedPaymentOutcome: (ctx.mockedOutcome === 'success') },
      session
    ];
  }
};
