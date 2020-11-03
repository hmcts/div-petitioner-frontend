const content = require('app/steps/petitioner/contact-details/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/contact-details/content.json').resources.cy.translation.content;
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');
const pagePath = '/petitioner-respondent/contact-details';

function enterPetitionerContactDetails() {
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.wait(1);
  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }
  I.retry(2).fillField('petitionerPhoneNumber', '01234567890');
  I.retry(2).checkOption(content.petitionerConsent);
  I.navByClick('Continue');
}

async function enterPetitionerContactDetailsCy() {
  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.wait(1);
  // if (parseBool(CONF.features.idam)) {
  //   I.see(idamConfigHelper.getTestEmail());
  // }
  I.retry(2).fillField('petitionerPhoneNumber', '01234567890');
  I.retry(2).checkOption(contentCy.petitionerConsent);
  await I.navByClick('Parhau');
}

module.exports = { enterPetitionerContactDetails, enterPetitionerContactDetailsCy };
