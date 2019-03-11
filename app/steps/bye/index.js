const ExitStep = require('app/core/steps/ExitStep');

const statusCodes = require('http-status-codes');

module.exports = class ExitMarriageBroken extends ExitStep {
  handler(req, res, next) {
    res.redirect(statusCodes.MOVED_PERMANENTLY, '/index');
    next();
  }
  get url() {
    return '/bye';
  }
};
