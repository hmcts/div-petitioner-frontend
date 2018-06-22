const idam = require('app/services/idam');
const CONF = require('config');

function idamProtect(req, res, next) {
  if (!CONF.features.idam) {
    return next();
  }

  return idam.protect()(req, res, next);
}

module.exports = { idamProtect };
