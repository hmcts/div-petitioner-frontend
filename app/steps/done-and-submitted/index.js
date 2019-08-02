const ExitStep = require('app/core/steps/ExitStep');
const paymentService = require('app/services/payment');

module.exports = class DoneAndSubmitted extends ExitStep {
  get url() {
    return '/done-and-submitted';
  }

  interceptor(ctx, session) {
    const paymentResult = paymentService.getCurrentPaymentStatus(session);
    if (session.paymentMethod === 'card-online') {
      ctx.paymentCompleted = paymentResult && paymentResult.toLowerCase() === 'success';
    }

    return super.interceptor(ctx, session);
  }
};