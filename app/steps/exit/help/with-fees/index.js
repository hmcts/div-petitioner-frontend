const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitNoHelpWithFees extends Step {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/help/no-reference-number';
  }
  get nextStep() {
    return null;
  }
};
