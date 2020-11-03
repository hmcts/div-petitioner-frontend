const content = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/confidential/content.json').resources.cy.translation.content;

const pagePath = '/petitioner-respondent/confidential';

function enterPeConfidentialContactDetails(shareAddress = true) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).checkOption(shareAddress ? content.share : content.keep);
  I.scrollPageToBottom();
  I.navByClick('Continue');
}

async function enterPeConfidentialContactDetailsCy(shareAddress = true) {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).checkOption(shareAddress ? contentCy.share : contentCy.keep);
  I.scrollPageToBottom();
  await I.navByClick('Parhau');
}

module.exports = { enterPeConfidentialContactDetails, enterPeConfidentialContactDetailsCy };
