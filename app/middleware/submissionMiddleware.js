const hasSubmitted = function(req, res, next) {
  const session = req.session;

  if (!this.enabledAfterSubmission && session.caseId) { // eslint-disable-line
    return res.redirect('/application-submitted');
  }

  return next();
};

module.exports = { hasSubmitted };
