function enterFinancialAdvice() {

  const I = this;

  I.waitUrlEquals('/about-divorce/financial/advice');
  I.navByClick('Continue');
}
module.exports = { enterFinancialAdvice };