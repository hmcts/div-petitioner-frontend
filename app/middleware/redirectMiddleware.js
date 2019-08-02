const CONF = require('config');
const _ = require('lodash');

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));

  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
  }

  return next();
};

module.exports = { redirectOnCondition };