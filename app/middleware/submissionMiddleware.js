/* eslint-disable spaced-comment */
//const config = require('config');

const hasSubmitted = function(req, res, next) {
  const session = req.session;

  const hasSubmittedEnabled = ['prod'].includes(config.deployment_env);

  if (hasSubmittedEnabled && !this.enabledAfterSubmission && session.caseId && session.state) { // eslint-disable-line
    switch (session.state) {
    case 'AwaitingPayment':
      return res.redirect('/application-submitted');
    case 'Rejected':
      return next();
    case 'MultipleRejectedCases':
      return res.redirect('/contact-divorce-team');
    default:
      return res.redirect('/application-submitted-awaiting-response');
    }
  }
  return next();
};

module.exports = { hasSubmitted };
