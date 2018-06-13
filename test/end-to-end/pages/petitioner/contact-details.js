const content = require('app/steps/petitioner/contact-details/content.json').resources.en.translation.content;
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

function enterPetitionerContactDetails() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/contact-details');
  I.see(idamConfigHelper.getTestEmail());
  I.fillField('petitionerPhoneNumber', '01234567890');
  I.checkOption(content.petitionerConsent);
  I.navByClick('Continue');
}

module.exports = { enterPetitionerContactDetails };