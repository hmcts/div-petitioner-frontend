const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const applicationFeeMiddleware = require('app/middleware/updateApplicationFeeMiddleware');

module.exports = class Done extends DestroySessionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/done';
  }

  get middleware() {
    return [
      ...super.middleware,
      applicationFeeMiddleware.updateApplicationFeeMiddleware
    ];
  }
};
