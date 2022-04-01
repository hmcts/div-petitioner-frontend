const CONF = require('config');
const logger = require('app/services/logger').logger(__filename);
const parseBool = require('app/core/utils/parseBool');

const redirectToLandingPageOnCondition = (req, res, next) => {
    const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);
    const redirectionStates = CONF.newAppCutoffRedirectStates;
    const { session } = req;
    const caseState = session.state;
    const redirect = redirectionStates.includes(caseState) || !caseState;
    const caseId = session.caseId;

    logger.infoWithReq(req, `Case Ref: ${caseId}`);
    logger.infoWithReq(req, `Redirection States: ${redirectionStates}`);
    logger.infoWithReq(req, `Redirect: ${redirect}`);
    logger.infoWithReq(req, `Redirect feature: ${redirectFeatureOn}`);
    logger.infoWithReq(req, 'PFE redirect check', `Case Ref: ${caseId}. Case State: ${caseState}.`);
    if (redirectFeatureOn && redirect) {
        return res.redirect('/cutoff-landing-page');
    }
    return next();
};

module.exports = { redirectToLandingPageOnCondition };