const pagePath = '/about-divorce/financial/advice';

function enterFinancialAdvice() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.navByClick('Continue');
}
function enterFinancialAdviceCy() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.navByClick('Parhau');
}

module.exports = { enterFinancialAdvice, enterFinancialAdviceCy };
