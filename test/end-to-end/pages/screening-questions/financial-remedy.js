function readFinancialRemedy() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/financial-remedy');
  I.navByClick('Continue');
}

module.exports = { readFinancialRemedy };