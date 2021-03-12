const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

const mockOrganisation = {
  name: 'Karen Fox Solicitor',
  reference: '02-002',
  email: 'karen@karenfox.co.uk',
  address: '1 Main st, Moira, Down, BT77 7RR, N.Ire, U.K'
};

function enterOrganisationManually(language = 'en', stepUrl, organisation = mockOrganisation) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const enterManually = language === 'en' ? 'Enter details manually' : '[CY] Enter details manually';
  const findAddress = language === 'en' ? 'Search' : '[CY] Search';

  const I = this;

  I.waitInUrl(stepUrl);
  I.seeInCurrentUrl(stepUrl);
  I.waitForVisible('#solicitor-search');
  I.fillField('respondentSolicitorFirm', organisation.name);
  I.navByClick(findAddress);

  I.waitForVisible('#solicitor-search-results');
  I.navByClick(enterManually);

  I.waitForVisible('#enter-manually');
  I.fillField('#respondentSolicitorName', organisation.name);
  I.fillField('#respondentSolicitorReference', organisation.reference);
  I.fillField('#respondentSolicitorEmail', organisation.email);
  I.fillField('#respondentSolicitorAddress', organisation.address);
  I.navByClick(commonContent.continue);
}

module.exports = { enterOrganisationManually };