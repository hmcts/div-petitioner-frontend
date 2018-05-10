const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitJurisdiction extends Step {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/jurisdiction/last-resort';
  }
  get nextStep() {
    return null;
  }
};
