const Step = require('app/core/steps/Step');

module.exports = class ExitMarriageDate extends Step {
  get url() {
    return '/exit/screening-questions/marriage-date';
  }
  get nextStep() {
    return null;
  }
};
