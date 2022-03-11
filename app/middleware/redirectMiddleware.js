const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');

  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
  }

  const today = new Date();
  const cutoff = new Date('2022-03-31T16:00:00');
  logger.infoWithReq(req, 'PFE Cutoff Landing Page Check', `Case Ref: ${caseId}. Date: ${today}. Cutoff Date: ${cutoff}`);
  // if (session && !caseId && today >= cutoff) {
  if (session && !caseId && today < cutoff) {
    logger.infoWithReq((req, 'New application cutoff date reached, and no in progress application.  Redirecting to cutoff landing page'));
    return res.redirect('/cutoff-landing-page');
  }

  return next();
};

module.exports = { redirectOnCondition };
