const mockOrganisation = {
  reference: '1YSAUCP',
  searchTerm: 'Divorce',
  name: 'Karen Fox',
  email: 'karen@karenfox.co.uk'
};

function enterOrganisationUsingLookup(language = 'en', stepUrl, organisation = mockOrganisation) {
  const continueButton = language === 'en' ? 'Continue' : '[CY] Continue';
  const findAddress = language === 'en' ? 'Search' : '[CY] Search';

  const I = this;

  I.waitInUrl(stepUrl);
  I.seeInCurrentUrl(stepUrl);
  I.waitForVisible('#solicitor-search');
  I.fillField('respondentSolicitorFirm', organisation.searchTerm);
  I.navByClick(findAddress);
  I.wait(10);
  I.waitForVisible('#solicitor-search-results');
  I.navByClick(`select-${organisation.reference}`);
  I.wait(4);
  I.fillField('respondentSolicitorName', organisation.name);
  I.fillField('respondentSolicitorEmail', organisation.email);
  I.fillField('respondentSolicitorReference', organisation.reference);
  I.wait(2);
  I.navByClick(continueButton);
}

module.exports = { enterOrganisationUsingLookup };