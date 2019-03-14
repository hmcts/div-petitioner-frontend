const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitNoCertificateTranslated extends ExitStep {
  constructor(steps, section, templatePath, content) {
    super(steps, section, templatePath, content, { logout: false });
  }

  get url() {
    return '/exit/about-your-marriage/no-certificate-translated';
  }
};
