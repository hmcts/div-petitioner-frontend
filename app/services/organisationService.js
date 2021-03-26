const OrganisationClient = require('@hmcts/prd-client').OrganisationClient;
const mockedClient = require('app/services/mocks/organisationServiceClient');
const CONF = require('config');
const { get } = require('lodash');

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
    const prdClientUrl = get(CONF, 'services.prdClient.baseUrl');
    client = CONF.deployment_env === 'local' ? mockedClient : new OrganisationClient(auth, serviceAuth, prdClientUrl);
    return service;
  }
};
