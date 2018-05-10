const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitApplicationSaved extends DestroySessionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/application-saved';
  }
};
