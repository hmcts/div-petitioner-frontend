const hasSubmitted = function(req, res, next) {
  const session = req.session;

  if (!this.enabledAfterSubmission && session.caseId) { // eslint-disable-line
    switch ((session.state).toLowerCase()) {
    case 'awaiting payment':
      return res.redirect('/application-submitted');
    case 'rejected':
      return next();
    default:
      return res.redirect('/application-submitted-awaiting-response');
    }
  }
  return next();
};

module.exports = { hasSubmitted };