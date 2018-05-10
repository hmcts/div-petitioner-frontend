const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitDesertionAgree extends Step {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/desertion/agree';
  }
  get nextStep() {
    return null;
  }
};
