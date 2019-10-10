const config = require('config');
const { get, set } = require('lodash');

const setSecret = (secretPath, configPath) => {
  // Only overwrite the value if the secretPath is defined
  if (config.has(secretPath)) {
    set(config, configPath, get(config, secretPath));
  }
};

const setup = () => {
  if (config.has('secrets.div')) {
    setSecret('secrets.div.session-secret', 'secret');
    setSecret('secrets.div.pfe-redis-connection-string', 'services.redis.host');
    setSecret('secrets.div.redis-secret', 'sessionEncryptionSecret');
    setSecret('secrets.div.idam-secret', 'idamArgs.idamSecret');
    setSecret('secrets.div.os-places-token', 'services.postcodeInfo.token');
    setSecret('secrets.div.frontend-secret', 'services.serviceAuthProvider.microserviceKey');
  }
};

module.exports = { setup };