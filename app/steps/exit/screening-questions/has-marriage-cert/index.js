const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitMarriageCertificate extends ExitStep {
  get url() {
    return '/exit/screening-questions/marriage-certificate';
  }
};
