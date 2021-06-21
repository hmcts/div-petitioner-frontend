const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsMarriageCertificate extends ScreeningValidationStep {
  get url() {
    return '/screening-questions/marriage-certificate';
  }

  get nextStep() {
    return {
      screenHasMarriageCert: {
        Yes: this.steps.ScreeningQuestionsFinancialRemedy,
        No: this.steps.ExitMarriageCertificate
      }
    };
  }

  get ignorePa11yWarnings() {
    return [
      // A11y thinks first paragraph should be a list
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48.2'
    ];
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
