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

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
