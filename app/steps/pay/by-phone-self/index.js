const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class PayByPhoneSelf extends ValidationStep {
  get enabledAfterSubmission() {
    return true;
  }

  get url() {
    return '/pay/card-over-phone-self';
  }

  get nextStep() {
    return this.steps.CheckYourAnswers;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
