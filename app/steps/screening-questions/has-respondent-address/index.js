const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsRespondentAddress extends ScreeningValidationStep {
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
};
