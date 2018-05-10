const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class Timeout extends DestroySessionStep {
  get url() {
    return '/timeout';
  }
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
