const pagePath = '/about-divorce/financial/advice';

function enterFinancialAdvice() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.navByClick('Continue');
}
module.exports = { enterFinancialAdvice };