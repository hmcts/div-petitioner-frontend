const payClient = require('@hmcts/div-pay-client');
const get = require('lodash/get');
const mockedClient = require('app/services/mocks/payment');
const CONF = require('config');

let client = {};

const service = {
  /**
   * Make a payment request via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  create: (...args) => {
    return client.create(...args)
      .then(response => {
        const { id, amount, state, reference, date_created } = response; // eslint-disable-line camelcase
        const nextUrl = get(response, '_links.next_url.href');

        return {
          id,
          amount,
          reference,
          state,
          dateCreated: date_created,
          nextUrl
        };
      });
  },

  /**
   * Query a payment status via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  query: (...args) => {
    return client.query(...args)
      .then(response => {
        const { id, amount, state, reference, date_created } = response; // eslint-disable-line camelcase

        return {
          id,
          amount,
          reference,
          state,
          dateCreated: date_created
        };
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
    return get(session.payments, `${session.currentPaymentId}.state`);
  },

  isPaymentSuccessful: response => {
    return get(response, 'state.finished') === true && get(response, 'state.status') === 'success';
  }
};
