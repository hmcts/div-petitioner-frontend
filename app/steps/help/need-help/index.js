const config = require('config');
const ValidationStep = require('app/core/steps/ValidationStep');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');
const parseBool = require('app/core/utils/parseBool');

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
    const applicationFee = parseBool(config.features.newFees) ? config.commonProps.applicationFee.newAmount : config.commonProps.applicationFee.amount;
    ctx.feeToBePaid = session.previousCaseId ? config.commonProps.amendFee.amount : applicationFee;
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
