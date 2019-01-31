const Step = require('./Step');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');

module.exports = class ExitStep extends Step {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout
    ];
  }
};
