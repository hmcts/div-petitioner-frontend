const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsNeedWelsh extends ScreeningValidationStep {
  get url() {
    return '/screening-questions/need-welsh';
  }
  get nextStep() {
    return {
      screenNeedWelsh: {
        Yes: this.steps.ScreeningQuestionsMarriageBroken,
        No: this.steps.ScreeningQuestionsMarriageBroken
      }
    };
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
