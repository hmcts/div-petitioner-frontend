const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class PetitionerConfidential extends ValidationStep {
  get url() {
    return '/petitioner-respondent/confidential';
  }
  get nextStep() {
    return this.steps.MarriageNames;
  }
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
