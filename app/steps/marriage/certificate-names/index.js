const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class MarriageCertificateNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names-on-certificate';
  }
  get nextStep() {
    return this.steps.PetitionerChangedNamed;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
