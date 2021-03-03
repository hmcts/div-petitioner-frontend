const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const CONF = require('config');

const logging = require('@hmcts/nodejs-logging');

const loggerInstance = logging.Logger.getLogger(__filename);

const confIdam = CONF.idamArgs;

const PUBLIC_HOSTNAME = CONF.public.hostname;
// const PUBLIC_PROTOCOL = CONF.public.protocol;
const redirectUri = `https://${PUBLIC_HOSTNAME}/authenticated`;

const landingPageUrl = PUBLIC_HOSTNAME ? redirectUri : confIdam.redirectUri;

const idamArgs = {
  redirectUri: landingPageUrl,
  indexUrl: confIdam.indexUrl,
  idamApiUrl: confIdam.idamApiUrl,
  idamLoginUrl: confIdam.idamLoginUrl,
  idamSecret: confIdam.idamSecret,
  idamClientID: confIdam.idamClientID
};

module.exports = {

  authenticate: (protocol, host, path, language = 'en') => {
    if (host) {
      // get the hostname part of the host string
      idamArgs.hostName = host.split(':')[0];
      idamArgs.redirectUri = protocol.concat('://', host, path);
      idamArgs.language = language;
    }
    loggerInstance.debug('idam request - authenticate with following: ', idamArgs);
    return idamExpressMiddleware.authenticate(idamArgs);
  },
  landingPage: () => {
    loggerInstance.debug('idam request - landingPage with following: ', idamArgs);
    return idamExpressMiddleware.landingPage(idamArgs);
  },
  protect: () => {
    loggerInstance.debug('idam request - protect with following: ', idamArgs);
    return idamExpressMiddleware.protect(idamArgs);
  },
  logout: () => {
    loggerInstance.debug('idam request - logout with following: ', idamArgs);
    return idamExpressMiddleware.logout(idamArgs);
  },
  userDetails: () => {
    loggerInstance.debug('idam request - userDetails with following: ', idamArgs);
    return idamExpressMiddleware.userDetails(idamArgs);
  },
  userId: req => {
    const hasIdamUserDetails = req && req.hasOwnProperty('idam') && req.idam.hasOwnProperty('userDetails');
    if (hasIdamUserDetails && req.idam.userDetails.id) {
      return req.idam.userDetails.id;
    }
    return undefined; // eslint-disable-line no-undefined
  }

};
