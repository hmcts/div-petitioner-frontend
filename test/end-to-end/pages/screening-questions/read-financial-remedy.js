const pagePath = '/screening-questions/financial-remedy';

function readFinancialRemedy() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.navByClick('Continue');
}

async function readFinancialRemedyCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  await I.navByClick('Parhau');
}

module.exports = { readFinancialRemedy, readFinancialRemedyCy };
