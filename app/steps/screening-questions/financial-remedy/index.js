const ScreeningValidationStep = require('app/core/steps/ScreeningValidationStep');

module.exports = class ScreeningQuestionsFinancialRemedy extends ScreeningValidationStep {
  get url() {
    return '/screening-questions/financial-remedy';
  }

  get nextStep() {
    return this.steps.NeedHelpWithFees;
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
