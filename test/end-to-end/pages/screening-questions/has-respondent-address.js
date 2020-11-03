const content = require('app/steps/screening-questions/has-respondent-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-respondent-address/content.json').resources.cy.translation.content;

function haveRespondentAddress() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/respondent-address');
  I.click(content.yes);
  I.navByClick('Continue');
}

async function haveRespondentAddressCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.seeInCurrentUrl(pagePath);
  I.click(contentCy.yes);
  I.navByClick('Parhau');
}

module.exports = { haveRespondentAddress, haveRespondentAddressCy };
