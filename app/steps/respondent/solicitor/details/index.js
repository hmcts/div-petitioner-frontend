const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class RespondentSolicitorDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/solicitor/details';
  }
};
