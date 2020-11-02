const contentEn = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-respondent-address/content.json').resources.cy.translation.content;

function haveRespondentAddress(language , commonContent) {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/respondent-address');

  if (language === 'en') {
    I.retry(2).click(contentEn.yes);
    I.navByClick(commonContent.continue);
    I.wait(2);
  } else {
    I.retry(2).click(contentCy.yes);
    I.navByClick(commonContent.continue);
    I.wait(2);
  }
}
module.exports = { haveRespondentAddress };
