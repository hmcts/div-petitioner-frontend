function setIdamUserDetails(req, res, next) {
  const hasValidSession = req.session && req.session.hasOwnProperty('expires');
  const hasIdamUserDetails = req.idam && req.idam.hasOwnProperty('userDetails');

  if (!hasIdamUserDetails || !hasValidSession) {
    return next();
  }

  const shouldUpdateEmail = !req.session.petitionerEmail && req.idam.userDetails.email;
  if (shouldUpdateEmail) {
    req.session.petitionerEmail = req.idam.userDetails.email;
  }

  return next();
}

module.exports = { setIdamUserDetails };
