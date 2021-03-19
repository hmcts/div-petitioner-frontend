const mockOrganisations = require('./responses/organisations.json');

module.exports = {
  getOrganisationByName: () => {
    return Promise.resolve(mockOrganisations);
  }
};
