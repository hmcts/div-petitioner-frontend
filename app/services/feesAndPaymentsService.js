const request = require('request-promise-native');
const CONF = require('config');

const feeCodeEndpoint = '/fees-and-payments/version/1/petition-issue-fee';

const get = () => {
  const uri = `${CONF.services.feesAndPayments.baseUrl}${feeCodeEndpoint}`;
  return request.get({ uri, json: true });
};

module.exports = { get };
