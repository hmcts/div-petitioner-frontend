const contentEn = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-respondent-address/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function haveRespondentAddress(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const respondentAddContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/screening-questions/respondent-address');
  I.retry(2).click(respondentAddContent.yes);
  I.navByClick(commonContent.continue);
}
module.exports = { haveRespondentAddress };
