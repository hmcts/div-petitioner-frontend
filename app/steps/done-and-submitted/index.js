const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const paymentService = require('app/services/payment');

module.exports = class DoneAndSubmitted extends DestroySessionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/done-and-submitted';
  }

  interceptor(ctx, session) {
    const paymentResult = paymentService.getCurrentPaymentStatus(session);
    if (session.paymentMethod === 'card-online') {
      ctx.paymentCompleted = paymentResult && paymentResult === 'success';
    }

    return super.interceptor(ctx, session);
  }
};
