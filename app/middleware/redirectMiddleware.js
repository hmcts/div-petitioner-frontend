const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');
  logger.infoWithReq(req, caseId);
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  logger.infoWithReq(req, `Redirection States: ${redirectionStates}`);
  const redirect = redirectionStates.includes(caseState) || !caseState;
  logger.infoWithReq(req, `Redirect: ${redirect}`);
  const toggle = JSON.parse(CONF.features.newAppCutoff);
  logger.infoWithReq(req, `Toggle: ${toggle}`);
  // eslint-disable-next-line no-undefined
  logger.infoWithReq(req, `TypeOf CaseId: ${typeof caseId === undefined}`);
  const isIndex = req.originalUrl === '/' || req.originalUrl === '/index' || req.origin === '/screening-questions/language-preference';
  logger.infoWithReq(req, `isIndex: ${isIndex}`);
  logger.infoWithReq(req, `Original URL: ${req.originalUrl}`);

  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
  } else if (isIndex) {
    return next();
  } else if (toggle && redirect) {
    logger.infoWithReq(req, 'PFE redirecting to Landing Page', `Case Ref: ${caseId}. Redirect check Passed.`);
    return res.redirect('/cutoff-landing-page');
  }

  return next();
};

module.exports = { redirectOnCondition };
