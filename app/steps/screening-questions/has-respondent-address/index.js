const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ScreeningQuestionsRespondentAddress extends OptionStep {
  get url() {
    return '/screening-questions/respondent-address';
  }
  get nextStep() {
    return {
      screenHasRespondentAddress: {
        Yes: this.steps.ScreeningQuestionsMarriageCertificate,
        No: this.steps.ExitRespondentAddress
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
