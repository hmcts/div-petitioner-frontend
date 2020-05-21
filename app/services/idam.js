const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const CONF = require('config');

const confIdam = CONF.idamArgs;

const PUBLIC_HOSTNAME = CONF.public.hostname;
const PUBLIC_PROTOCOL = CONF.public.protocol;
const redirectUri = `${PUBLIC_PROTOCOL}://${PUBLIC_HOSTNAME}/authenticated`;

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

  authenticate: (protocol, host, path) => {
    if (host) {
      // get the hostname part of the host string
      idamArgs.hostName = host.split(':')[0];
      idamArgs.redirectUri = protocol.concat('://', host, path);
    }
    return idamExpressMiddleware.authenticate(idamArgs);
  },
  landingPage: () => {
    return idamExpressMiddleware.landingPage(idamArgs);
  },
  protect: () => {
    return idamExpressMiddleware.protect(idamArgs);
  },
  logout: () => {
    return idamExpressMiddleware.logout(idamArgs);
  },
  userDetails: () => {
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
