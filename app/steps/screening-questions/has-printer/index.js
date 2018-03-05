const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ScreeningQuestionsPrinter extends OptionStep {
  get url() {
    return '/screening-questions/printer';
  }
  get nextStep() {
    return {
      screenHasPrinter: {
        Yes: this.steps.NeedHelpWithFees,
        No: this.steps.ExitPrinter
      }
    };
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
