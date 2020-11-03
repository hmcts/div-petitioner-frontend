const content = require('app/steps/marriage/husband-or-wife/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/husband-or-wife/content.json').resources.cy.translation.content;
const pagePath = '/about-your-marriage/details';

function selectDivorceType() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.husband);
  I.navByClick('Continue');
}

async function selectDivorceTypeCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.husband);
  await I.navByClick('Parhau');
}

module.exports = { selectDivorceType, selectDivorceTypeCy };
