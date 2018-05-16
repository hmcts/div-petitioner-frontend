const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class ScreeningQuestionsRespondentAddress extends ValidationStep {
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
