const content = require('app/steps/screening-questions/language-preference/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/language-preference/content.json').resources.cy.translation.content;

function languagePreference() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/language-preference');
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

async function languagePreferenceCy() {
  const I = this;

  let pagePath = await I.getCurrentPageUrl();
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.yes);
  await I.navByClick('Parhau');
}

function languageToggle() {

  const I = this;

  I.click('.govuk-link.language');
  I.wait(3);
}

module.exports = { languagePreference, languagePreferenceCy, languageToggle };
