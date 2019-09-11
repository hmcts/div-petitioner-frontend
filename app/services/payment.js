const payClient = require('@hmcts/div-pay-client');
const request = require('request-promise-native');
const get = require('lodash/get');
const mockedClient = require('app/services/mocks/payment');
const CONF = require('config');
const logger = require('app/services/logger').logger(__filename);

let client = {};

const service = {
  /**
   * Make a payment request via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  create: (req, user, serviceToken, caseReference, siteId, feeCode,
    feeVersion, amountInput, description, returnUrl, serviceCallbackUrl) => {
    return client.create(user, serviceToken, caseReference, siteId, feeCode,
      feeVersion, amountInput, description, returnUrl, serviceCallbackUrl)
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
        logger.errorWithReq(req, 'payment_error', 'Error creating payment with ccd case number', caseReference, error.message);
        throw error;
      });
  },

  /**
   * Query a payment status via the pay-client
   *
   * @see @hmcts/div-pay-client for params
   * @returns {Promise}
   */
  query: (req, user, serviceToken, referenceInput, mockedPaymentOutcome) => {
    return client.query(user, serviceToken, referenceInput,
      mockedPaymentOutcome)
      .then(response => {
        const {
          id, amount, status, reference,
          external_reference, date_created // eslint-disable-line camelcase
        } = response;

        return {
          id,
          amount,
          reference,
          external_reference,
          status,
          date_created
        };
      })
      .catch(error => {
        logger.errorWithReq(req, 'payment_query_error', 'Error getting payment details for payment reference caseId', referenceInput, error.message);
        throw error;
      });
  },
  /**
   * Query the payment API to return all payment references for a case
   *
   * @returns {Promise}
   */
  queryAllPayments: (req, user, serviceToken, caseId) => {
    return request.get({
      uri: `${CONF.services.payment.baseUrl}/payments?ccd_case_number=${caseId}`,
      headers: {
        Authorization: `Bearer ${user.bearerToken}`,
        ServiceAuthorization: `Bearer ${serviceToken}`
      },
      json: true
    })
      .catch(error => {
        logger.errorWithReq(req, 'payment_query_error', 'Error getting payment details for payment reference caseId', caseId, error.message);
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
    const secret = CONF.services.serviceAuthProvider.microserviceKey;
    client = secret ? payClient.init(options) : mockedClient;

    return service;
  },

  getCurrentPaymentStatus: session => {
    return get(session.payments, `${session.currentPaymentId}.status`);
  },

  isPaymentSuccessful: response => {
    const respStatus = get(response, 'status');
    return (typeof respStatus === 'string' ? respStatus : 'undefined').toUpperCase() === 'Success'.toUpperCase();
  }
};
