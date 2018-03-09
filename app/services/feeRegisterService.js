const request = require('request-promise-native');
const CONF = require('config');

const feeEndpoint = '/fees-register/fees/lookup';

const get = ({ queryParameters = '' }) => {
  const uri = `${CONF.services.feeRegister.baseUrl}${feeEndpoint}?${queryParameters}`;

  return request.get({ uri, json: true });
};

module.exports = { get };
