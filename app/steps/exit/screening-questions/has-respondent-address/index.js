const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class ExitRespondentAddress extends DestroySessionStep {
  get url() {
    return '/exit/screening-questions/respondent-address';
  }
};
