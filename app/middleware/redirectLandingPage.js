const CONF = require('config');
const _ = require('lodash');
const logger = require('app/services/logger').logger(__filename);
const parseBool = require('app/core/utils/parseBool');

const redirectToLandingPageOnCondition = (req, res, next) => {
  const session = req.session;
  const caseId = _.get(session, 'caseId');
  const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);
  logger.infoWithReq(req, `Redirect feature: ${redirectFeatureOn}`);
  logger.infoWithReq(req, `Case Ref: ${caseId}`);
  if (redirectFeatureOn) {
    return res.redirect('/cutoff-landing-page');
  }
  return next();
};

module.exports = { redirectToLandingPageOnCondition };