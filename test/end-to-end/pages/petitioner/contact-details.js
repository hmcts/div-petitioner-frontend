const content = require('app/steps/petitioner/contact-details/content.json').resources.en.translation.content;
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

function enterPetitionerContactDetails() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/contact-details');
  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }
  I.fillField('petitionerPhoneNumber', '01234567890');
  I.checkOption(content.petitionerConsent);
  I.navByClick('Continue');
}

module.exports = { enterPetitionerContactDetails };
