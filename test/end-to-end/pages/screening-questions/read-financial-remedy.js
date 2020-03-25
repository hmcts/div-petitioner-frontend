const pagePath = '/screening-questions/financial-remedy';

function readFinancialRemedy() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.navByClick('Continue');
}

module.exports = { readFinancialRemedy };