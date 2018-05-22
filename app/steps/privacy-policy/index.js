const Step = require('app/core/steps/Step');

module.exports = class PrivacyPolicy extends Step {
  get url() {
    return '/privacy-policy';
  }
};
