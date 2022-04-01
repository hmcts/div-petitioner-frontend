const logger = require('app/services/logger').logger(__filename);

const redirectToLandingPageOnCondition = (req, res, next) => {
  logger.infoWithReq(req, 'PFE redirect check', 'Redirect straightaway');
  const { session } = req;
  // when a new case has just been submitted for the session
  if (session.caseId) {
    return res.redirect('/cutoff-landing-page');
  }
  return next();

};

module.exports = { redirectToLandingPageOnCondition };