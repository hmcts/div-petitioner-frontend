const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

const mockOrganisation = {
  reference: '02-002',
  name: 'Karen Fox',
  email: 'karen@karenfox.co.uk'
};

function enterOrganisationUsingLookup(language = 'en', stepUrl, organisation = mockOrganisation) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const findAddress = language === 'en' ? 'Search' : '[CY] Search';

  const I = this;

  I.waitInUrl(stepUrl);
  I.seeInCurrentUrl(stepUrl);
  I.waitForVisible('#solicitor-search');
  I.fillField('respondentSolicitorFirm', organisation.name);
  I.navByClick(findAddress);
  I.wait(4);
  I.waitForVisible('#solicitor-search-results');
  I.navByClick(`select-${organisation.reference}`);
  I.wait(4);
  I.fillField('respondentSolicitorName', organisation.name);
  I.fillField('respondentSolicitorEmail', organisation.email);
  I.fillField('respondentSolicitorReference', organisation.reference);
  I.wait(2);
  I.navByClick(commonContent.continue);
}

module.exports = { enterOrganisationUsingLookup };