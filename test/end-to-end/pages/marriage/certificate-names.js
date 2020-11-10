const contentEn = require('app/steps/marriage/certificate-names/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/certificate-names/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/names-on-certificate';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterMarriageCertificateDetails(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const certificateDetailsContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.waitForText(certificateDetailsContent.question);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.navByClick(commonContent.continue);
}

module.exports = { enterMarriageCertificateDetails };
