const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ScreeningQuestionsMarriageCertificate extends OptionStep {
  get url() {
    return '/screening-questions/marriage-certificate';
  }

  get nextStep() {
    return {
      screenHasMarriageCert: {
        Yes: this.steps.NeedHelpWithFees,
        No: this.steps.ExitMarriageCertificate
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
