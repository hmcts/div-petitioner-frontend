const contentEn = require('app/steps/petitioner/contact-details/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/contact-details/content.json').resources.cy.translation.content;
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

const pagePath = '/petitioner-respondent/contact-details';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;


function enterPetitionerContactDetails(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const contactDetails = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.wait(1);

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }
  I.retry(2).fillField('petitionerPhoneNumber', '01234567890');
  I.retry(2).checkOption(contactDetails.petitionerConsent);
  I.click(commonContent.continue);
}

module.exports = { enterPetitionerContactDetails };
