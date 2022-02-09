const Step = require('app/core/steps/Step');

module.exports = class TermsAndConditions extends Step {
  get url() {
    return '/terms-and-conditions';
  }
  get nextStep() {
    return null;
  }
  get ignorePa11yWarnings() {
    return [
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48',
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48.2',
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H71.SameName'
    ];
  }
};
