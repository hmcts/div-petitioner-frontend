const CONF = require('config');
const co = require('co');
const superagent = require('superagent');

require('superagent-proxy')(superagent);

const timeout = CONF.services.postcodeInfo.timeout;

const statusCode = require('app/core/utils/statusCode');

exports.client = (
  tokenString, url, sa = superagent
) => {
  const token = `Token ${tokenString}`;

  return {

    lookupPostcode(postcode) {
      const proxy = process.env.DIVORCE_HTTP_PROXY;

      return co(function* generator() {
        try {
          let request = sa.get(`${url}/addresses/?postcode=${encodeURIComponent(postcode)}`)
            .set('Authorization', token)
            .timeout(timeout);

          if (proxy) {
            request = request.proxy(proxy);
          }

          const { body, status } = yield request;
          const addresses = body || [];
          const valid = Boolean(addresses.length);

          const error = status !== statusCode.OK;

          return { valid, addresses, error };
        } catch (error) {
          return { error };
        }
      });
    }
  };
};
