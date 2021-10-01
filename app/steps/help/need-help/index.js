const config = require('config');
const ValidationStep = require('app/core/steps/ValidationStep');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class NeedHelpWithFees extends ValidationStep {
  get url() {
    return '/pay/help/need-help';
  }
  get nextStep() {
    return {
      helpWithFeesNeedHelp: {
        Yes: this.steps.WithFees,
        No: this.steps.MarriageHusbandOrWife
      }
    };
  }

  interceptor(ctx, session) {
    ctx.feeToBePaid = session.previousCaseId ? config.commonProps.amendFee.amount : config.commonProps.applicationFee.amount;
    return ctx;
  }

  get middleware() {
    return [
      ...super.middleware,
      applicationFeeMiddleware.updateApplicationFeeMiddleware,
      applicationFeeMiddleware.updateAmendFeeMiddleware
    ];
  }
};
