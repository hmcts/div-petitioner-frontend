const Step = require('app/core/steps/Step');

module.exports = class ExitRespondentAddress extends Step {
  get url() {
    return '/exit/screening-questions/respondent-address';
  }
};
