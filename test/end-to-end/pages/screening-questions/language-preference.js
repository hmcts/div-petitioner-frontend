const content = require('app/steps/screening-questions/language-preference/content.json').resources.en.translation.content;

function languagePreference() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/language-preference');
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

module.exports = { languagePreference: languagePreference };
