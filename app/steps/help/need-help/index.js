const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

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

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
