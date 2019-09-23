const Step = require('app/core/steps/Step');

module.exports = class AccessibilityStatement extends Step {
  get url() {
    return '/accessibility-statement';
  }
};
