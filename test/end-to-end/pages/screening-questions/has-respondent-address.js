const contentEn = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-respondent-address/content.json').resources.cy.translation.content;
const pagePath = '/screening-questions/respondent-address';

function haveRespondentAddress(language = 'en') {
  const respondentAddContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(respondentAddContent.yes);
  I.click('submit');
}

module.exports = { haveRespondentAddress };