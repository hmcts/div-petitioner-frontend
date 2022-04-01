const CONF = require('config');
const logger = require('app/services/logger').logger(__filename);
const parseBool = require('app/core/utils/parseBool');

const redirectToLandingPageOnCondition = (req, res, next) => {
  const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);
  logger.infoWithReq(req, `Redirect feature: ${redirectFeatureOn}`);
  logger.infoWithReq(req, 'PFE redirect check', 'Redirect straightaway');
  const { session } = req;
  logger.infoWithReq(req, `Case ref: ${session.caseId}`);
  if (redirectFeatureOn && session.caseId) {
    return res.redirect('/cutoff-landing-page');
  }
  return next();
};

module.exports = { redirectToLandingPageOnCondition };