const Step = require('app/core/steps/Step');

module.exports = class ExitNoHelpWithFees extends Step {
  get url() {
    return '/exit/help/no-reference-number';
  }
  get nextStep() {
    return null;
  }
};
