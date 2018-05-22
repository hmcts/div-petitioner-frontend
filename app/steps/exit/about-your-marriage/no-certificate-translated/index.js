const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class ExitNoCertificateTranslated extends DestroySessionStep {
  get url() {
    return '/exit/about-your-marriage/no-certificate-translated';
  }
};
