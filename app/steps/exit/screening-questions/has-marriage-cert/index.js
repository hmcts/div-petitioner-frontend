const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class ExitMarriageCertificate extends DestroySessionStep {
  get url() {
    return '/exit/screening-questions/marriage-certificate';
  }
};
