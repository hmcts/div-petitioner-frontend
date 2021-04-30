const contentEn = require('app/steps/screening-questions/language-preference/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/language-preference/content.json').resources.cy.translation.content;
const pagePath = '/screening-questions/language-preference';

function languagePreference(language = 'en') {

  const languageContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.see(languageContent.yes);
  I.retry(2).click(languageContent.yes);
  I.retry(3).clickLink('submit');
}

module.exports = { languagePreference: languagePreference };
