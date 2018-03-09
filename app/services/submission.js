const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const CONF = require('config');
const get = require('lodash/get');
const moment = require('moment');

let client = {};

/**
 * Format timestamp date value from payment response to a formatted date
 *
 * @param {number|string} timestamp
 * @returns {string}
 */
const formatDate = timestamp => {
  return moment(parseInt(timestamp))
    .format(CONF.paymentDateFormat);
};

const service = {
  submit: (...args) => {
    return client.submit(...args)
      .then(response => {
        return response;
      });
  },

  update: (...args) => {
    return client.update(...args)
      .then(response => {
        return response;
      });
  }
};

/**
 * Generate event data for payment updates
 *
 * @param {Object} session
 * @param {Object} response Payment service response
 * @returns {{payment: {PaymentChannel: string, PaymentTransactionId: *, PaymentReference: *, PaymentDate: string, PaymentAmount: *, PaymentStatus: *, PaymentFeeId: string, PaymentSiteId: *}}}
 */
const generatePaymentEventData = (session, response) => {
  const { id, amount, reference, state, dateCreated } = response;
  // Provide status when finished, empty string otherwise.
  const paymentStatus = get(state, 'status');
  const siteId = get(session, `court.${session.courts}.siteId`);

  return {
    payment: {
      PaymentChannel: 'card',
      PaymentTransactionId: id,
      PaymentReference: reference,
      PaymentDate: formatDate(dateCreated),
      PaymentAmount: amount,
      PaymentStatus: paymentStatus,
      PaymentFeeId: CONF.commonProps.applicationFee.code,
      PaymentSiteId: siteId
    }
  };
};

const setup = () => {
  const options = { baseUrl: CONF.services.transformation.baseUrl };
  // If the microservice key is not set we fall back to mocks.
  const secret = process.env.MICROSERVICE_KEY;
  client = secret ? transformationServiceClient.init(options) : mockedClient;

  return service;
};

module.exports = { generatePaymentEventData, setup };
