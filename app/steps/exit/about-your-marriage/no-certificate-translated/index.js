const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitNoCertificateTranslated extends ExitStep {
  get url() {
    return '/exit/about-your-marriage/no-certificate-translated';
  }
};
