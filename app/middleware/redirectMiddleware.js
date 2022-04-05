const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

const pfeRedirectCheck = (req, res, session, caseState, courtId, caseId) => {
  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return `${appLandingPage}${queryString}`;
  }
  return false;
};

const newAppCutoffRedirectCheck = (req, res, session, caseState, courtId, caseId) => {
  const today = new Date();
  const cutoffDate = new Date(CONF.newAppCutoffDate);
  const cutoff = JSON.parse(CONF.newAppCutoffDateOverride) ? true : today >= cutoffDate;
  const hasCaseId = JSON.parse(CONF.newAppCutoffCaseIdOverride) || Boolean(session && caseId);
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  const redirect = JSON.parse(CONF.newAppCutoffStateOverride) || redirectionStates.includes(caseState) || !caseState;

  logger.infoWithReq(null, 'New App Cutoff redirect check', `
    =================================================================================================================
      Date: ${today}
      Application cutoff date: ${cutoffDate}
      Cutoff reached: ${cutoff}
      Cutoff Override: ${CONF.newAppCutoffDateOverride}
      Case Id: ${caseId}
      Has Case Id: ${hasCaseId}
      Case Id Override: ${CONF.newAppCutoffCaseIdOverride}
      Case State: ${caseState}
      Case State Redirect: ${redirect}
      Case State Override: ${CONF.newAppCutoffStateOverride}
    =================================================================================================================
  `);
  if (cutoff && (!hasCaseId || redirect)) {
    logger.infoWithReq(null, 'New App Cutoff redirect result', `
    =================================================================================================================
      Application cutoff date reached, and redirection is required for this request.
      Redirecting to cutoff landing page.
    =================================================================================================================
  `);
    return '/cutoff-landing-page';
  }
  let logMsg = `
    =================================================================================================================
      Application cutoff date reached, redirection not required for this request.
      No redirect.
    =================================================================================================================
  `;
  if (!cutoff) {
    logMsg = `
    =================================================================================================================
      Application cutoff date not reached.
      No redirect.
    =================================================================================================================
  `;
  }
  logger.infoWithReq(null, 'New App Cutoff redirect result', logMsg);
  return false;
};

const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');

  const pfeRedirect = pfeRedirectCheck(req, res, session, caseState, courtId, caseId);
  if (pfeRedirect) {
    logger.infoWithReq(req, `PFE Redirect Target: ${pfeRedirect}`);
    return res.redirect(pfeRedirect);
  }
  logger.infoWithReq(req, `PFE Redirect ${pfeRedirect}`);

  // ==================================================================================================================
  // Cutoff Date Landing Page Redirect
  // ==================================================================================================================
  if (JSON.parse(CONF.features.newAppCutoff) && req.originalUrl !== '/cutoff-landing-page') {
    const newAppCutoffRedirect = newAppCutoffRedirectCheck(req, res, session, caseState, courtId, caseId);
    if (newAppCutoffRedirect) {
      logger.infoWithReq(req, `New App Cutoff Redirect Target: ${newAppCutoffRedirect}`);
      return res.redirect(newAppCutoffRedirect);
    }
    logger.infoWithReq(req, `New App Cutoff Redirect ${newAppCutoffRedirect}`);
  }
  // ==================================================================================================================
  // End Cutoff Date Landing Page Redirect
  // ==================================================================================================================

  return next();
};

module.exports = { redirectOnCondition };
