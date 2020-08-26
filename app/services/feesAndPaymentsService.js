const request = require('request-promise-native');
const CONF = require('config');

const feeCodeEndpoint = '/fees-and-payments/version/1';

const getFee = feeType => {
  const uri = `${CONF.services.feesAndPayments.baseUrl}${feeCodeEndpoint}/${feeType}`;
  return request.get({ uri, json: true });
};

const feeTypes = {
  applicationFee: 'petition-issue-fee',
  amendFee: 'amend-fee',
  enforcementFee: 'enforcement-fee',
  appWithoutNoticeFee: 'application-without-notice-fee'
};

const feeService = { getFee };

module.exports = { feeService, feeTypes };
