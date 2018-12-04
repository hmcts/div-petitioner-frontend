const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  // feature flag
  if (parseBool(CONF.features.redirectOnState)) {
    // If there is state, there must be a CCD case
    const hasCaseState = req.session && req.session.state;

    if (hasCaseState && CONF.ccd.courts.includes(req.session.courts) && !CONF.ccd.d8States.includes(req.session.state)) {
      const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
      const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
      return res.redirect(`${appLandingPage}${queryString}`);
    }
  }

  return next();
};

module.exports = { redirectOnCondition };