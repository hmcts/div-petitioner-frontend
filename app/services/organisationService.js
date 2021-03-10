const OrganisationClient = require('@hmcts/prd-client').OrganisationClient;
const mockedClient = require('app/services/mocks/organisationServiceClient');
const CONF = require('config');

let client = {};

const service = {
  /**
   * Requests all organisations that match param organisationName
   * @param {String} status status of organisations i.e active
   * @param {String} organisationName name of the organisation to filter results on
   * @returns {Promise}
   */
  getOrganisationByName: (status, organisationName) => {
    return client.getOrganisationByName(status, organisationName);
  }
};

module.exports = {
  setup: (auth, serviceAuth) => {
    client = CONF.environment === 'production' ? new OrganisationClient(auth, serviceAuth) : mockedClient;

    return service;
  }
};