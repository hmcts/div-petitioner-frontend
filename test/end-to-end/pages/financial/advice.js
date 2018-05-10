function enterFinancialAdvice() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/financial/advice');
  I.navByClick('Continue');
}
module.exports = { enterFinancialAdvice };