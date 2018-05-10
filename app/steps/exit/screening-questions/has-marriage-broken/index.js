const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitMarriageBroken extends DestroySessionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/screening-questions/marriage-broken';
  }
};
