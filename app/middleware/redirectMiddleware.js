const CONF = require('config');

const redirectOnCondition = (req, res, next) => {
  // If state, there must be a CCD case
  const hasCaseState = req.session && req.session.state;
  if (hasCaseState && !CONF.ccd.d8States.includes(req.session.state)) {
    return res.redirect(CONF.apps.dn.url);
  }

  return next();
};

module.exports = { redirectOnCondition };