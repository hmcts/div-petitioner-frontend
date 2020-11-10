const content = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/confidential';

function enterPeConfidentialContactDetails(shareAddress = true) {

  const I = this;
  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).checkOption(shareAddress ? content.share : content.keep);
  I.scrollPageToBottom();
  I.navByClick('Continue');
}

module.exports = { enterPeConfidentialContactDetails };
