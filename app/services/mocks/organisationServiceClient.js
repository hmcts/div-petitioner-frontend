const mockOrganisations = require('./responses/organisations.json');

module.exports = {
  getOrganisationByName: () => {
    return new Promise.resolve(mockOrganisations);
  }
};