const content = require('app/steps/petitioner/correspondence/use-home-address/content.json').resources.en.translation.content;
const prettifyAddress = require('test/end-to-end/helpers/GeneralHelpers.js').prettifyAddress;

function enterCorrespondence(addressObj) {

  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/petitioner-correspondence/use-home-address');
  if (addressObj) {
    I.see(prettifyAddress(addressObj));
  }
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { enterCorrespondence };