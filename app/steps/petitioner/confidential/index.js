const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class PetitionerConfidential extends ValidationStep {
  get url() {
    return '/petitioner-respondent/confidential';
  }
  get nextStep() {
    return this.steps.MarriageNames;
  }
};
