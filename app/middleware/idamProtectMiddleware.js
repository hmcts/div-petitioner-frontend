const idam = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

function idamProtect(req, res, next) {
  if (!features.idam) {
    return next();
  }

  const middlewareNext = (userDetails = {}) => {
    req.idam = { userDetails };
    next();
  };

  return idam.protect()(req, res, middlewareNext);
}

module.exports = { idamProtect };
