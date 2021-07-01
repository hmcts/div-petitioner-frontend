const CONF = require('config');
const co = require('co');
const httpStatus = require('http-status-codes');
const superagent = require('superagent');

require('superagent-proxy')(superagent);
const timeout = CONF.services.postcodeInfo.timeout;

exports.client = (
  tokenString, url, sa = superagent
) => {
  return {

    lookupPostcode(postcode) {
      const proxy = CONF.divorceHttpProxy;
      return co(function* generator() {
        try {
          let request = sa.get(`${url}/postcode?postcode=${encodeURIComponent(postcode)}&key=${tokenString}`)
            .timeout(timeout);
          if (proxy) {
            request = request.proxy(proxy);
          }

          const { body, status } = yield request;
          const addresses = body.results || [];
          const valid = Boolean(addresses.length);
          const error = status !== httpStatus.OK;
          return { valid, addresses, error };
        } catch (error) {
          if (error.status === httpStatus.BAD_REQUEST) {
            // Do not return Bad Request error as it will be handled by custom logic
            return {};
          }
          return { error };
        }
      });
    }
  };
};
