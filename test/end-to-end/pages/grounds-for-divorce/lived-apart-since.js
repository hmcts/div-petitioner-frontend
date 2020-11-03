const content = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.cy.translation.content;


function selectLivingApartTime() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separation/lived-apart-since');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

function selectLivingApartTimeCy() {

  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/separation/lived-apart-since');
  I.checkOption(contentCy.yes);
  I.navByClick('Parhau');
}

module.exports = { selectLivingApartTime, selectLivingApartTimeCy };
