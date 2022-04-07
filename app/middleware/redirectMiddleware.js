const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

const pfeRedirectCheck = req => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');
  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return `${appLandingPage}${queryString}`;
  }
  return false;
};

const newAppCutoffRedirectCheck = req => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const caseId = _.get(session, 'caseId');
  const hasCaseId = JSON.parse(CONF.newAppCutoffCaseIdOverride) || Boolean(session && caseId);
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  const redirect = JSON.parse(CONF.newAppCutoffStateOverride) || redirectionStates.includes(caseState) || !caseState;

  logger.infoWithReq(null, 'New App Cutoff redirect check', `
    =================================================================================================================
      Case Id: ${caseId}
      Has Case Id: ${hasCaseId}
      Case Id Override: ${CONF.newAppCutoffCaseIdOverride}
      Case State: ${caseState}
      Case State Redirect: ${redirect}
      Case State Override: ${CONF.newAppCutoffStateOverride}
    =================================================================================================================
  `);
  if (!hasCaseId || redirect) {
    logger.infoWithReq(null, 'New App Cutoff redirect result', `
    =================================================================================================================
      Redirecting to cutoff landing page.
    =================================================================================================================
    `);
    return '/cutoff-landing-page';
  }

  logger.infoWithReq(null, 'New App Cutoff redirect result', `
    =================================================================================================================
      No redirect.
    =================================================================================================================
  `);
  return false;
};

const amendRedirectCheck = req => {
  const session = req.session;
  if (session && session.hasOwnProperty('previousCaseId')) {
    logger.infoWithReq(req, `Amend Journey for Previous Case Id: ${session.previousCaseId}`);
    if (req.originalUrl === '/cutoff-landing-page') {
      return '/screening-questions/language-preference';
    }
    return true;
  }
  return false;
};

const redirectOnCondition = (req, res, next) => {
  const pfeRedirect = pfeRedirectCheck(req);
  if (pfeRedirect) {
    logger.infoWithReq(req, `PFE Redirect Target: ${pfeRedirect}`);
    return res.redirect(pfeRedirect);
  }
  logger.infoWithReq(req, `PFE Redirect ${pfeRedirect}`);

  const amendRedirect = amendRedirectCheck(req);
  if (amendRedirect) {
    if (amendRedirect === true) {
      logger.infoWithReq(req, 'Amend Journey Redirect true - skipping New App Cutoff Redirect Check');
      return next();
    }
    logger.infoWithReq(req, `Amend Journey Redirect Target: ${amendRedirect}`);
    return res.redirect(amendRedirect);
  }
  logger.infoWithReq(req, `Amend Journey Redirect ${amendRedirect}`);

  if (JSON.parse(CONF.features.newAppCutoff) && req.originalUrl !== '/cutoff-landing-page') {
    const newAppCutoffRedirect = newAppCutoffRedirectCheck(req);
    if (newAppCutoffRedirect) {
      logger.infoWithReq(req, `New App Cutoff Redirect Target: ${newAppCutoffRedirect}`);
      return res.redirect(newAppCutoffRedirect);
    }
    logger.infoWithReq(req, `New App Cutoff Redirect ${newAppCutoffRedirect}`);
  }

  return next();
};

module.exports = { redirectOnCondition, pfeRedirectCheck, amendRedirectCheck, newAppCutoffRedirectCheck };
