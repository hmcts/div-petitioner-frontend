const pagePath = '/about-divorce/financial/advice';

function enterFinancialAdvice() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.navByClick('Continue');
}

async function enterFinancialAdviceCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 3);
  I.seeInCurrentUrl(pagePath);
  await I.navByClick('Parhau');
}

module.exports = { enterFinancialAdvice, enterFinancialAdviceCy };
