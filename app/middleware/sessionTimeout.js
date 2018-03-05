const CONF = require('config');

const expires = CONF.session.expires;

module.exports = function sessionTimeout(req, res, next) {
  const session = req.session;

  if (!/\/(graph|healthcheck|session|sitemap|timeout)/.test(req.originalUrl)) {
    if (session.expires <= Date.now()) {
      res.redirect('/timeout');
      return;
    }


    //  if session.expires already exists, extend the expiry date
    //  otherwise setup the session.expires via the initSession middleware
    if (session.expires) {
      session.expires = Date.now() + expires;
    }
  }
  next();
};
