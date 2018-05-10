const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class TermsAndConditions extends Step {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/terms-and-conditions';
  }
  get nextStep() {
    return null;
  }
  get ignorePa11yWarnings() {
    return [
      // A11y thinks first paragraph should be a list
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48'
    ];
  }
};