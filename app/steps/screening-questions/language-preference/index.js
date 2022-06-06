const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsLanguagePreference extends ScreeningValidationStep {
  get url() {
    return '/screening-questions/language-preference';
  }

  get nextStep() {
    return {
      languagePreferenceWelsh: {
        Yes: this.steps.ScreeningQuestionsMarriageBroken,
        No: this.steps.ScreeningQuestionsMarriageBroken
      }
    };
  }
};
