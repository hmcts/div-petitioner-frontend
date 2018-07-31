const config = require('config');

const hasSubmitted = function(req, res, next) {
  const session = req.session;

  const hasSubmittedEnabled = ['prod'].includes(config.deployment_env);

  if (hasSubmittedEnabled && !this.enabledAfterSubmission && session.caseId) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      return res.redirect('/application-submitted');
    case 'Rejected':
      return next();
    default:
      return res.redirect('/application-submitted-awaiting-response');
    }
  }
  return next();
};

module.exports = { hasSubmitted };
