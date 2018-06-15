const request = require('request-promise-native');
const CONF = require('config');

const feeCodeEndpoint = '/fees-and-payments';

const get = ({ queryParameters = '' }) => {
  const uri = `${CONF.services.feesAndPayments.baseUrl}${feeCodeEndpoint}?${queryParameters}`;

  return request.get({ uri, json: true });
};

module.exports = { get };
