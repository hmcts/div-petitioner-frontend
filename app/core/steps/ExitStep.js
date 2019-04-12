const Step = require('./Step');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');
const logger = require('app/services/logger').logger(__filename);

module.exports = class ExitStep extends Step {
  constructor(steps, section, templatePath, content,
    options = { logout: true }) {
    super(steps, section, templatePath, content);
    this.logout = options.logout;
  }

  preResponse(req) {
    logger.infoWithReq(req, 'ExitStep', 'Entering PreResponse');
    return new Promise(resolve => {
      if (this.logout) {
        logger.infoWithReq(req, req.session);
        req.session.regenerate(() => {
          logger.infoWithReq(req, 'ExitStep', 'Regenerating Session');
          resolve();
          logger.infoWithReq(req, 'ExitStep', 'Regenerated Session');
          logger.infoWithReq(req, req.session);
        });
      } else {
        logger.infoWithReq(req, 'ExitStep', 'Not Regenerating');
        resolve();
      }
      logger.infoWithReq(req, 'ExitStep', 'After Regen');
    });
  }

  get middleware() {
    const exitMiddleware = [];
    logger.infoWithReq(null, 'ExitStep', 'Load Middleware');

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