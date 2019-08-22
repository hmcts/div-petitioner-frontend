const content = require('app/steps/petitioner/correspondence/use-home-address/content.json').resources.en.translation.content;
const prettifyAddress = require('test/end-to-end/helpers/GeneralHelpers.js').prettifyAddress;
const pagePath = '/petitioner-respondent/petitioner-correspondence/use-home-address';

function enterCorrespondence(addressObj) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (addressObj) {
    I.see(prettifyAddress(addressObj));
  }
  I.retry(2).click(content.yes);
  I.scrollPageToBottom();
  I.navByClick('Continue');
}

module.exports = { enterCorrespondence };