const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitRespondentAddress extends ExitStep {
  get url() {
    return '/exit/screening-questions/respondent-address';
  }
};
