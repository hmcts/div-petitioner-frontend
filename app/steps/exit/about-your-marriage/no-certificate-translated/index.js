const Step = require('app/core/steps/Step');

module.exports = class ExitNoCertificateTranslated extends Step {
  get url() {
    return '/exit/about-your-marriage/no-certificate-translated';
  }
};
