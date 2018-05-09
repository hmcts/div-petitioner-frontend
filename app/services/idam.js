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

  authenticate: (protocol, hostName, path) => {
    if (hostName) {
      idamArgs.hostName = hostName;
      idamArgs.redirectUri = protocol.concat('://', hostName, path);
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
  }

};
