const content = require('app/steps/marriage/husband-or-wife/content.json').resources.en.translation.content;

function selectDivorceType() {

  const I = this;

  I.waitUrlEquals('/about-your-marriage/details');
  I.checkOption(content.husband);
  I.navByClick('Continue');
}

module.exports = { selectDivorceType };