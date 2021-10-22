const contentEn = require('app/steps/petitioner/correspondence/use-home-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/correspondence/use-home-address/content.json').resources.cy.translation.content;

const prettifyAddress = require('test/end-to-end/helpers/GeneralHelpers.js').prettifyAddress;

const pagePath = '/petitioner-respondent/petitioner-correspondence/use-home-address';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterCorrespondence(language = 'en', addressObj) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const homeAddress = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  if (addressObj) {
    I.see(prettifyAddress(addressObj));
  }
  I.retry(2).click(homeAddress.yes);
  I.scrollPageToBottom();
  I.click(commonContent.continue);
}

module.exports = { enterCorrespondence };
