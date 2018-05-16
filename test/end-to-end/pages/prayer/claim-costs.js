const content = require('app/steps/prayer/claim-costs/content.json').resources.en.translation.content;

function enterClaimCosts() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/claim-costs');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { enterClaimCosts };