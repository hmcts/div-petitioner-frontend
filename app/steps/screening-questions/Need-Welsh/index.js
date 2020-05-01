const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsMarriageBroken extends ScreeningValidationStep {
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
};
