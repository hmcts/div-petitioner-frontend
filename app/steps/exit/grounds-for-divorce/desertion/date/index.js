const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitDesertionDate extends Step {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/desertion/when';
  }
  get nextStep() {
    return null;
  }
};
