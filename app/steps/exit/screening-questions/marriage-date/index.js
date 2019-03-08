const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitMarriageDate extends ExitStep {
  get url() {
    return '/exit/screening-questions/marriage-date';
  }
  get nextStep() {
    return null;
  }
};
