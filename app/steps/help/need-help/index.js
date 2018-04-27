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

  get middleware() {
    return [
      ...super.middleware,
      applicationFeeMiddleware.updateApplicationFeeMiddleware
    ];
  }
};
