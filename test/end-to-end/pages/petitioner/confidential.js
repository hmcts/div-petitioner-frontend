const content = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/confidential';

function enterPeConfidentialContactDetails() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).checkOption(content.share);
  I.scrollPageToBottom();
  I.navByClick('Continue');
}

module.exports = { enterPeConfidentialContactDetails };