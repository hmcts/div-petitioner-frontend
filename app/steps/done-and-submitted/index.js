const ExitStep = require('app/core/steps/ExitStep');
const config = require('config');
const paymentService = require('app/services/payment');
const parseBool = require('app/core/utils/parseBool');


module.exports = class DoneAndSubmitted extends ExitStep {
  get url() {
    return '/done-and-submitted';
  }

  interceptor(ctx, session) {
    ctx.financialOrderApplicationFee = parseBool(config.features.newFees) ? config.commonProps.financialOrderApplicationFeeNew : config.commonProps.financialOrderApplicationOldFee;
    const paymentResult = paymentService.getCurrentPaymentStatus(session);
    if (session.paymentMethod === 'card-online') {
      ctx.paymentCompleted = paymentResult && paymentResult.toLowerCase() === 'success';
    }

    if (this.shouldGetAllocatedCourtFromCourtList(session)) {
      session.allocatedCourt = session.court[session.courts];
    }

    return super.interceptor(ctx, session);
  }

  shouldGetAllocatedCourtFromCourtList(session) {
    return !session.hasOwnProperty('allocatedCourt') && session.hasOwnProperty('court') && session.hasOwnProperty('courts');
  }
};
