const CONF = require('config');
const idam = require('app/services/idam');
const parseBool = require('app/core/utils/parseBool');
const logger = require('app/services/logger').logger(__filename);

const signOutRoute = app => {
  const nextMiddleware = (req, res, next) => {
    next();
  };

  app.get('/sign-out',
    parseBool(CONF.features.idam) ? idam.logout() : nextMiddleware,
    (req, res) => {
      req.session.regenerate(error => {
        if (error) {
          logger.errorWithReq(req, 'signing_out', 'Error signing out');
        }
        res.redirect('/index');
      });
    });
};

module.exports = signOutRoute;