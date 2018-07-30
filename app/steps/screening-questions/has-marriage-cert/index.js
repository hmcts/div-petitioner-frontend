const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class ScreeningQuestionsMarriageCertificate extends ValidationStep {
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

  get ignorePa11yWarnings() {
    return [
      // Paragraph with 2 links in it but it's not semantically a list
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48'
    ];
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
