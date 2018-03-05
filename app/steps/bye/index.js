const DestroySessionStep = require('app/core/DestroySessionStep');

const statusCodes = require('http-status-codes');

module.exports = class ExitMarriageBroken extends DestroySessionStep {
  handler(req, res) {
    res.redirect(statusCodes.MOVED_PERMANENTLY, '/index');
  }
  get url() {
    return '/bye';
  }
};
