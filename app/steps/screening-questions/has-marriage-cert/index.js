const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

module.exports = class ScreeningQuestionsMarriageCertificate extends OptionStep {
  get url() {
    return '/screening-questions/marriage-certificate';
  }

  get nextStep() {
    return {
      screenHasMarriageCert: {
        Yes: features.onlineSubmission ? this.steps.NeedHelpWithFees : this.steps.ScreeningQuestionsPrinter,
        No: this.steps.ExitMarriageCertificate
      }
    };
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
