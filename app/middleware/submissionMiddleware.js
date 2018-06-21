const hasSubmitted = function(req, res, next) {
  const session = req.session;

  if (!this.enabledAfterSubmission && session.caseId) {
    switch (session.status) {
    case 'Awaiting Payment':
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