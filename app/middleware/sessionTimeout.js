const CONF = require('config');
const { noop } = require('lodash');
const parseRequest = require('../core/helpers/parseRequest');
const draftPetitionStoreMiddleware = require('./draftPetitionStoreMiddleware');

const expires = CONF.session.expires;

module.exports = function sessionTimeout(req, res, next) {
  const {
    saveSessionToDraftStore,
    saveSessionToDraftStoreAndReply
  } = draftPetitionStoreMiddleware;
  const session = req.session;
  const sessionExpired = session.expires <= Date.now();

  const ignoredPaths = [
    '/graph',
    '/healthcheck',
    '/session',
    '/sitemap',
    '/timeout'
  ];

  if (!ignoredPaths.includes(req.originalUrl)) {
    if (sessionExpired && req.headers['x-save-draft-session-only']) {
      saveSessionToDraftStoreAndReply.call(this, req, res, next);
      return;
    }

    if (sessionExpired) {
      Object.assign(req.session, parseRequest.parse(this, req));
      saveSessionToDraftStore.call(this, req, res, noop);
      res.redirect('/timeout');
      return;
    }

    //  if session.expires already exists, extend the expiry date
    //  otherwise setup the session.expires via the initSession middleware
    if (session.expires) {
      session.expires = Date.now() + expires;
    }
  }
  next();
};
