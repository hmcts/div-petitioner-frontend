const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

/* eslint-disable complexity */
const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  const redirect = redirectionStates.includes(caseState) || !caseState;

  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  logger.infoWithReq(req, JSON.stringify(session));
  logger.infoWithReq(req, `
    =================================================================================================================
      Case Id: ${caseId}
      Case State: ${caseState}
      State Redirect: ${redirect}
    =================================================================================================================
  `);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
    // eslint-disable-next-line no-undefined
  } else if (JSON.parse(CONF.features.newAppCutoff) && (!typeof caseId === undefined || redirect)) {
    return res.redirect('/cutoff-landing-page');
  }

  return next();
};
/* eslint-enable complexity */

module.exports = { redirectOnCondition };
