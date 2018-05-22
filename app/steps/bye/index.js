const DestroySessionStep = require('app/core/steps/DestroySessionStep');

const statusCodes = require('http-status-codes');

module.exports = class ExitMarriageBroken extends DestroySessionStep {
  handler(req, res, next) {
    res.redirect(statusCodes.MOVED_PERMANENTLY, '/index');
    next();
  }
  get url() {
    return '/bye';
  }
};
