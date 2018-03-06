const CONF = require('config');

const expires = CONF.session.expires;
const index = CONF.paths.index;

const redirectToIndex = (req, res, next) => {
  const isIndex = req.originalUrl === '/' || req.originalUrl === '/index';

  if (isIndex) {
    next();
  } else {
    //  index is / which redirects to /index
    res.redirect(index);
  }
};

function initSessionMiddleware(req, res, next) {
  const session = req.session;
  const isNewSession = !session.hasOwnProperty('expires');

  if (isNewSession) {
    session.expires = Date.now() + expires;
    //  redirect since there is a new session
    redirectToIndex(req, res, next);
    return;
  }

  next();
}

module.exports = initSessionMiddleware;
