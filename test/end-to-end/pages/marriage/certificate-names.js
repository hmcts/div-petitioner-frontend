const pagePath = '/petitioner-respondent/names-on-certificate';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterMarriageCertificateDetails(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.click(commonContent.continue);
}

module.exports = { enterMarriageCertificateDetails };
