const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);

const authTokenString = '__auth-token';

const redirectOnCondition = (req, res, next) => {
  const session = req.session;
  logger.infoWithReq(req, `Req: ${JSON.parse(req)}`);
  logger.infoWithReq(req, `Session: ${JSON.parse(session)}`);
  const caseState = _.get(session, 'state');
  const courtId = _.get(session, 'allocatedCourt.courtId', _.get(session, 'courts'));
  const caseId = _.get(session, 'caseId');
  logger.infoWithReq(req, caseId);
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  logger.infoWithReq(req, `Redirection States: ${redirectionStates}`);
  const redirect = redirectionStates.includes(caseState) || !caseState;
  logger.infoWithReq(req, `Redirect: ${redirect}`);
  logger.infoWithReq(req, `Toggle: ${CONF.features.newAppCutoff}`);
  // eslint-disable-next-line no-undefined
  logger.infoWithReq(req, `TypeOf CaseId: ${typeof caseId === undefined}`);

  logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}. Court ID: ${courtId}.`);
  if (caseState && CONF.ccd.courts.includes(courtId) && !CONF.ccd.d8States.includes(caseState)) {
    logger.infoWithReq(req, 'PFE redirecting to DN', `Case Ref: ${caseId}. Redirect check Passed.`);
    const appLandingPage = `${CONF.apps.dn.url}${CONF.apps.dn.landing}`;
    const queryString = `?${authTokenString}=${req.cookies[authTokenString]}`;
    return res.redirect(`${appLandingPage}${queryString}`);
  }

  return next();
};

module.exports = { redirectOnCondition };
