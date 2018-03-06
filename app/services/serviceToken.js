const serviceAuthProviderClient = require('@hmcts/div-service-auth-provider-client');
const mockedClient = require('app/services/mocks/serviceToken');
const CONF = require('config');

let client = {};
let serviceToken = null;

const service = {
  /**
   * Requests a service token via the service-auth-provider client
   *
   * @returns {Promise}
   */
  getToken: () => {
    return new Promise((resolve, reject) => {
      if (serviceToken && !client.isTokenExpired(serviceToken)) {
        resolve(serviceToken);
        return;
      }
      client.lease()
        .then(token => {
          serviceToken = token;
          resolve(token);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
};

module.exports = {
  setup: () => {
    const options = {
      apiBaseUrl: CONF.services.serviceAuthProvider.baseUrl,
      microservice: CONF.services.serviceAuthProvider.microserviceName,
      secret: CONF.services.serviceAuthProvider.microserviceKey
    };
    // Use the mock client if the microservice key is not set.
    client = options.secret ? serviceAuthProviderClient.init(options) : mockedClient;

    return service;
  }
};
