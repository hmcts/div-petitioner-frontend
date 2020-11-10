const content = require('app/steps/screening-questions/language-preference/content.json').resources.en.translation.content;

function languagePreference() {

  const I = this;

  I.waitInUrl('/screening-questions/language-preference');
  I.waitForText(content.question);
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

module.exports = { languagePreference: languagePreference };
