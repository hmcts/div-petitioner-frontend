const content = require('app/steps/petitioner/contact-details/content.json').resources.en.translation.content;

function enterPetitionerContactDetails() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/contact-details');
  I.fillField('petitionerEmail', 'example@example.com');
  I.fillField('petitionerPhoneNumber', '01234567890');
  I.checkOption(content.petitionerConsent);
  I.navByClick('Continue');
}

module.exports = { enterPetitionerContactDetails };