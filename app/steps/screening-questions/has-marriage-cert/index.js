const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

module.exports = class ScreeningQuestionsMarriageCertificate extends ScreeningValidationStep {
  get url() {
    return '/screening-questions/marriage-certificate';
  }

  get nextStep() {
    const nextStep = parseBool(config.features.showSystemMessage) ? this.steps.SystemMessage : this.steps.NeedHelpWithFees;
    return {
      screenHasMarriageCert: {
        Yes: nextStep,
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
