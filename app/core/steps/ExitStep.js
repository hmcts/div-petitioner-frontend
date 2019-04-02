const Step = require('./Step');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');
const logging = require('app/services/logger');

const logger = logging.logger(__filename);


module.exports = class ExitStep extends Step {
  constructor(steps, section, templatePath, content,
    options = { logout: true }) {
    super(steps, section, templatePath, content);
    this.logout = options.logout;
  }

  preResponse(req) {
    return new Promise(resolve => {
      if (this.logout) {
        req.session.regenerate(error => {
          logger.errorWithReq(req, 'session_regenerate', 'error regenerating session', error.message);
          resolve();
        });
      } else {
        logger.infoWithReq(req, 'session_regenerate', 'Not a logout, will not regenerate session', '');
        resolve();
      }
    });
  }

  get middleware() {
    const exitMiddleware = [];

    if (this.logout) {
      // on first hit, init session will pass. on second hit (i.e. refresh)
      // the user will be redirected to index page
      exitMiddleware.push(initSession);
      if (parseBool(CONF.features.idam)) {
        exitMiddleware.push(idam.logout());
      }
    }

    return exitMiddleware;
  }
};