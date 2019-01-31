const ExitStep = require('./ExitStep');
const idam = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

module.exports = class DestroySessionStep extends ExitStep {
  preResponse(req) {
    return new Promise(resolve => {
      req.session.regenerate(() => {
        resolve();
      });
    });
  }

  get middleware() {
    // on first hit, init session will pass. on second hit (i.e. refresh)
    // the user will be redirected to index page
    const destroySessionMiddleware = [initSession];
    if (parseBool(CONF.features.idam)) {
      destroySessionMiddleware.push(idam.logout());
    }

    return destroySessionMiddleware;
  }
};
