const content = require('app/steps/marriage/in-the-uk/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/in-the-uk/content.json').resources.cy.translation.content;
const pagePath = '/about-your-marriage/in-the-uk';

function selectMarriedInUk() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

function selectMarriedElsewhere() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/in-the-uk');
  I.checkOption(content.no);
  I.navByClick('Continue');
}

async function selectMarriedInUkCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.yes);
  await I.navByClick('Parhau');
}

module.exports = { selectMarriedInUk, selectMarriedElsewhere, selectMarriedInUkCy };
