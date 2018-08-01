/* eslint-disable complexity */
const logger = require('app/services/logger').logger(__filename);

const hasSubmitted = function(req, res, next) {
  const session = req.session;

  if (!this.enabledAfterSubmission && session.caseId && session.state) { // eslint-disable-line
    logger.debug(`A case has attempted to resume with status: ${session.state}`);
    switch (session.state) {
    case 'AwaitingPayment':
      return res.redirect('/application-submitted');
    case 'AwaitingDocuments':
      return res.redirect('/application-submitted-awaiting-response');
    case 'AwaitingHWFDecision':
      return res.redirect('/application-submitted-awaiting-response');
    case 'Issued':
      return res.redirect('/application-submitted-awaiting-response');
    case 'PendingRejection':
      return res.redirect('/application-submitted-awaiting-response');
    case 'Submitted':
      return res.redirect('/application-submitted-awaiting-response');
    case 'Rejected':
      return next();
    default:
      return next();
    }
  }
  return next();
};

module.exports = { hasSubmitted };
