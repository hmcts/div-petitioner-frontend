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

  // ==================================================================================================================
  // Cutoff Date Landing Page Redirect
  // ==================================================================================================================
  const debugCutOffLandingPage = true;
  const debugLog = msg => {
    if (!debugCutOffLandingPage) {
      return;
    }
    const debugLogger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

    debugLogger.info(msg);
  };

  const today = new Date();
  const cutoffDate = new Date(CONF.newAppCutoffDate);
  // const cutoff = today >= cutoffDate;
  const cutoff = true; // Force this for testing
  const redirectionStates = [
    'AwaitingPayment',
    'AwaitingHWFDecision',
    'AwaitingDocuments',
    'Withdrawn',
    'PendingRejection',
    'Rejected'
  ];
  const redirect = redirectionStates.includes(caseState);
  debugLog(`
      =================================================================================================================
        Date: ${today}
        Application cutoff date: ${cutoffDate}
        Cutoff reached: ${cutoff}
        Case Id: ${caseId}
        Case State: ${caseState}
        State Redirect: ${redirect}
      =================================================================================================================
    `);
  if (cutoff && ((session && !caseId) || redirect)) {
    debugLog(`
      =================================================================================================================
        Application cutoff date reached, and redirection is required for this request.
        Redirecting to cutoff landing page.
      =================================================================================================================
    `);
    return res.redirect('/cutoff-landing-page');
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
  debugLog(logMsg);
  // ==================================================================================================================
  // End Cutoff Date Landing Page Redirect
  // ==================================================================================================================

  return next();
};

module.exports = { redirectOnCondition };
