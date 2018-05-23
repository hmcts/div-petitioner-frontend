const idam = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

function idamProtect(req, res, next) {
  if (!features.idam) {
    return next();
  }

  return idam.protect()(req, res, next);
}

module.exports = { idamProtect };
