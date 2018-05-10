const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ScreeningQuestionsMarriageBroken extends OptionStep {
  get url() {
    return '/screening-questions/has-marriage-broken';
  }
  get nextStep() {
    return {
      screenHasMarriageBroken: {
        Yes: this.steps.ScreeningQuestionsRespondentAddress,
        No: this.steps.ExitMarriageBroken
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
