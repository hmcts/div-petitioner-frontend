const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class MarriageCertificateNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names-on-certificate';
  }
  get nextStep() {
    return this.steps.PetitionerChangedNamed;
  }
};
