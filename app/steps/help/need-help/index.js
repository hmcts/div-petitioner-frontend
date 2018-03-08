const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { updateApplicationFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class NeedHelpWithFees extends OptionStep {
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
    return [...super.middleware, updateApplicationFeeMiddleware];
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
