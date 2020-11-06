const contentEn = require('app/steps/screening-questions/language-preference/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/language-preference/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function languagePreference(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const languageContent = language === 'en' ? contentEn : contentCy;

  const I = this;

  I.seeInCurrentUrl('/screening-questions/language-preference');

  if (language === 'en') {
    I.retry(2).click(languageContent.yes);
    I.navByClick(commonContent.continue);
  } else {
    I.retry(2).click(languageContent.yes);
    I.navByClick(commonContent.continue);
  }

}

module.exports = { languagePreference: languagePreference };
