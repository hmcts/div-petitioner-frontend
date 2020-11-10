const content = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;
const pagePath = '/screening-questions/respondent-address';

function haveRespondentAddress() {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.click(content.yes);
  I.navByClick('Continue');
}
module.exports = { haveRespondentAddress };
