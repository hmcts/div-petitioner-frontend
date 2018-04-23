const idamExpressMiddleware = require('@hmcts/div-idam-express-middleware');
const CONF = require('config');

const confIdam = CONF.idamArgs;

const PUBLIC_HOSTNAME = process.env.PUBLIC_HOSTNAME;
const PUBLIC_PROTOCOL = process.env.PUBLIC_PROTOCOL || 'https';
const redirectUri = `${PUBLIC_PROTOCOL}://${PUBLIC_HOSTNAME}/authenticated`;

const landingPageUrl = PUBLIC_HOSTNAME ? redirectUri : confIdam.redirectUri;

const idamArgs = {
  redirectUri: landingPageUrl,
  indexUrl: confIdam.indexUrl,
  idamApiUrl: process.env.IDAM_API_URL || confIdam.idamApiUrl,
  idamLoginUrl: process.env.IDAM_LOGIN_URL || confIdam.idamLoginUrl,
  idamSecret: process.env.IDAM_SECRET || confIdam.idamSecret,
  idamClientID: process.env.IDAM_CLIENT_ID || confIdam.idamClientID
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
