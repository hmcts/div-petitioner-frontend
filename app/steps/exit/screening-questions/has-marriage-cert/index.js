const Step = require('app/core/steps/Step');

module.exports = class ExitMarriageCertificate extends Step {
  get url() {
    return '/exit/screening-questions/marriage-certificate';
  }
};
