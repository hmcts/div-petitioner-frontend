const pagePath = '/petitioner-respondent/names';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterPetitionerAndRespondentNames(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');

  if (language === 'en') {
    I.navByClick(commonContent.continue);
  } else {
    I.navByClick(commonContent.continue);
  }
}

module.exports = { enterPetitionerAndRespondentNames };
