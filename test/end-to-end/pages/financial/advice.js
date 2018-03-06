function enterFinancialAdvice() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/financial/advice');
  I.click('Continue');
}
module.exports = { enterFinancialAdvice };