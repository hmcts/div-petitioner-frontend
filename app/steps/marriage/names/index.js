const ValidationStep = require('app/core/steps/ValidationStep');
const capitalizeNames = require('app/middleware/capitalizeNames');

module.exports = class MarriageNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names';
  }
  get nextStep() {
    return this.steps.MarriageCertificateNames;
  }
  get postMiddleware() {
    return [
      capitalizeNames,
      ...super.postMiddleware
    ];
  }
};
