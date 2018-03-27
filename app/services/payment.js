const payClient = require('@hmcts/div-pay-client');
const get = require('lodash/get');
const mockedClient = require('app/services/mocks/payment');
const CONF = require('config');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);

let client = {};

const service = {
  /**
   * Make a payment request via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  create: (user, serviceToken, caseReference, siteId, feeCode,
    feeVersion, amountInput, description, returnUrl) => {
    return client.create(user, serviceToken, caseReference, siteId, feeCode,
      feeVersion, amountInput, description, returnUrl)
      .then(response => {
        const { id, amount, status, reference, date_created } = response; // eslint-disable-line camelcase
        const nextUrl = get(response, '_links.next_url.href');

        return {
          id,
          amount,
          reference,
          status,
          date_created,
          nextUrl
        };
      })
      .catch(error => {
        logger.error(`Error creating payment with ccd case number ${caseReference}: ${error}`);
        throw error;
      });
  },

  /**
   * Query a payment status via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  query: (user, serviceToken, referenceInput, mockedPaymentOutcome) => {
    return client.query(user, serviceToken, referenceInput,
      mockedPaymentOutcome)
      .then(response => {
        const {
          id, amount, status, external_reference,
          date_created
        } = response; // eslint-disable-line camelcase

        return {
          id,
          amount,
          external_reference,
          status,
          date_created
        };
      })
      .catch(error => {
        logger.error(`Error getting payment details for payment reference caseId ${referenceInput}: ${error}`);
        throw error;
      });
  }
};

module.exports = {
  setup: () => {
    const options = {
      apiBaseUrl: CONF.services.payment.baseUrl,
      serviceIdentification: CONF.services.payment.serviceIdentification
    };
    // Use the mock client if the microservice key is not set.
    const secret = process.env.MICROSERVICE_KEY;
    client = secret ? payClient.init(options) : mockedClient;

    return service;
  },

  getCurrentPaymentStatus: session => {
    return get(session.payments, `${session.currentPaymentId}.status`);
  },

  isPaymentSuccessful: response => {
    return get(response, 'status') === 'success';
  }
};
