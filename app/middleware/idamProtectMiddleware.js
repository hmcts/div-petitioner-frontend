const idam = require('app/services/idam');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

function idamProtect(req, res, next) {
  if (!parseBool(CONF.features.idam)) {
    return next();
  }

  return idam.protect()(req, res, next);
}

module.exports = { idamProtect };
