const CONF = require('config');

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  const hasCaseState = req.session && req.session.state;

  if (hasCaseState && CONF.ccd.courts.includes(req.session.courts) && !CONF.ccd.d8States.includes(req.session.state)) {
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
  }

  return next();
};

module.exports = { redirectOnCondition };