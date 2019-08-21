const content = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/confidential';

function enterPeConfidentialContactDetails() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.share);
  I.retry(2).navByClick('Continue');
}

module.exports = { enterPeConfidentialContactDetails };