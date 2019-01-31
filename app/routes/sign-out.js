const CONF = require('config');
const idam = require('app/services/idam');
const parseBool = require('app/core/utils/parseBool');

const signOutRoute = app => {
  const nextMiddleware = (req, res, next) => {
    next();
  };

  app.get('/sign-out',
    parseBool(CONF.features.idam) ? idam.logout() : nextMiddleware,
    (req, res) => {
      req.session.regenerate(() => {
        res.redirect('/index');
      });
    });
};

module.exports = signOutRoute;