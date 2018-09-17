const transformationServiceClient = require('app/services/transformationServiceClient');
const mockedClient = require('app/services/mocks/transformationServiceClient');
const CONF = require('config');
const get = require('lodash/get');
const moment = require('moment');
const logger = require('app/services/logger').logger(__filename);

const PENCE_PER_POUND = 100;

let client = {};

/**
 * Format timestamp date value from payment response to a formatted date
 *
 * @param {number|string} timestamp
 * @returns {string}
 */
const service = {
  submit: (...args) => {
    return client.submit(...args)
      .then(response => {
        return response;
      })
      .catch(error => {
        logger.error({
          message: `Error submitting caseId ${args.caseId} to ccd:`,
          error
        });
        throw error;
      });
  },

  update: (...args) => {
    return client.update(...args)
      .then(response => {
        return response;
      })
      .catch(error => {
        logger.error({
          message: `Error updating ccd with caseId ${args.caseId}:`,
          error
        });
        throw error;
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
  const
    { external_reference, amount, reference, status, date_created } = response; // eslint-disable-line camelcase
  // Provide status when finished, empty string otherwise.
  const siteId = get(session, `court.${session.courts}.siteId`);
  let eventData = null;

  if (CONF.features.fullPaymentEventDataSubmission) {
    eventData = {
      payment: {
        PaymentChannel: 'online',
        PaymentTransactionId: external_reference,
        PaymentReference: reference,
        PaymentDate: moment(date_created).format(CONF.paymentDateFormat),
        PaymentAmount: amount * PENCE_PER_POUND,
        PaymentStatus: status,
        PaymentFeeId: CONF.commonProps.applicationFee.feeCode,
        PaymentSiteId: siteId
      }
    };
  } else {
    eventData = {
      payment:
        { PaymentReference: reference }
    };
  }
  return eventData;
};

const setup = () => {
  const options = { baseUrl: CONF.services.transformation.baseUrl };
  // If the microservice key is not set we fall back to mocks.
  const secret = CONF.services.serviceAuthProvider.microserviceKey;
  client = secret ? transformationServiceClient.init(options) : mockedClient;

  return service;
};

module.exports = { generatePaymentEventData, setup };
