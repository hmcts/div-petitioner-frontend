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

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
