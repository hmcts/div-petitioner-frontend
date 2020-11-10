const contentEn = require('app/steps/marriage/names/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/names/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/names';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterPetitionerAndRespondentNames(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const namesContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.waitForText(namesContent.question);
  I.retry(2).fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');
  I.navByClick(commonContent.continue);
}

module.exports = { enterPetitionerAndRespondentNames };
