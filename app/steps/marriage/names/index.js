const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class MarriageNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names';
  }
  get nextStep() {
    return this.steps.MarriageCertificateNames;
  }
};
