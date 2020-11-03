const content = require('app/steps/prayer/claim-costs/content.json').resources.en.translation.content;
const contentCy = require('app/steps/prayer/claim-costs/content.json').resources.cy.translation.content;
const pagePath = '/about-divorce/claim-costs';

function enterClaimCosts() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

function enterClaimCostsCorrespondent() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.yes);
  I.checkOption( '#correspondent');
  I.navByClick('Continue');
}

function enterClaimCostsCy() {

  const I = this;

  I.waitInUrl(pagePath, 3);
  I.seeInCurrentUrl(pagePath);
  I.checkOption(contentCy.yes);
  I.navByClick('Parhau');
}

module.exports = { enterClaimCosts, enterClaimCostsCorrespondent, enterClaimCostsCy };
