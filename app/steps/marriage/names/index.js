const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class MarriageNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names';
  }
  get nextStep() {
    return this.steps.MarriageCertificateNames;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
