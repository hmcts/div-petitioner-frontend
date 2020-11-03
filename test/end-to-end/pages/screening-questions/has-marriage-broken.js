const content = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.cy.translation.content;

function haveBrokenMarriage() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/has-marriage-broken');
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

async function haveBrokenMarriageCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.yes);
  await I.navByClick('Parhau');
}


module.exports = { haveBrokenMarriage, haveBrokenMarriageCy };
