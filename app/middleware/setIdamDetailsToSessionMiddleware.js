const idam = require('app/services/idam');

function setIdamUserDetails(req, res, next) {
  const hasValidSession = req.session && req.session.hasOwnProperty('expires');

  if (!idam.userId(req) || !hasValidSession) {
    return next();
  }

  const shouldUpdateEmail = !req.session.petitionerEmail && req.idam.userDetails.email;
  if (shouldUpdateEmail) {
    req.session.petitionerEmail = req.idam.userDetails.email;
  }

  return next();
}

module.exports = { setIdamUserDetails };
