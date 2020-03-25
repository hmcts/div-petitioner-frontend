const content = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;

function haveRespondentAddress() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/respondent-address');
  I.click(content.yes);
  I.navByClick('Continue');
}
module.exports = { haveRespondentAddress };