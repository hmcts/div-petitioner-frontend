const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const parseBool = require('app/core/utils/parseBool');

const redirectToLandingPageOnCondition = (req, res, next) => {
  const session = req.session;
  const caseState = _.get(session, 'state');
  const caseId = _.get(session, 'caseId');
  const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);
  logger.infoWithReq(req, `Redirect feature: ${redirectFeatureOn}`);
  logger.infoWithReq(req, `Case Ref: ${caseId}`);
  const redirectionStates = CONF.newAppCutoffRedirectStates;
  logger.infoWithReq(req, `Redirection States: ${redirectionStates}`);
  const redirect = redirectionStates.includes(caseState) || !caseState;
  logger.infoWithReq(req, `Redirect: ${redirect}`);
  logger.infoWithReq(req, 'PFE redirect landing page check', `Case Ref: ${caseId}. Case State: ${caseState}`);
  if (redirectFeatureOn && redirect) {
    return res.redirect('/cutoff-landing-page');
  }
  return next();
};

module.exports = { redirectToLandingPageOnCondition };