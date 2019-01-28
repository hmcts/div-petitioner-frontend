const request = require('request-promise-native');
const CONF = require('config');

const feeCodeEndpoint = '/fees-and-payments/version/1';

const getFee = feeType => {
  const uri = `${CONF.services.feesAndPayments.baseUrl}${feeCodeEndpoint}/${feeType}`;
  return request.get({ uri, json: true });
};

const get = () => {
  return getFee('petition-issue-fee');
};

module.exports = {
  get,
  getFee
};