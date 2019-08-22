const content = require('app/steps/marriage/husband-or-wife/content.json').resources.en.translation.content;
const pagePath = '/about-your-marriage/details';

function selectDivorceType() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.husband);
  I.navByClick('Continue');
}

module.exports = { selectDivorceType };