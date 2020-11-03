const content = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const contentCy = require('app/steps/help/need-help/content.json').resources.cy.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/pay/help/with-fees';

function enterHelpWithFees(appliedForFees = content.yes) {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(appliedForFees);
  if (appliedForFees) {
    I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
  }
  I.navByClick('Continue');
}

async function enterHelpWithFeesCy(appliedForFees = contentCy.yes) {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(appliedForFees);
  if (appliedForFees) {
    I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
  }
  await I.navByClick('Parhau');
}

module.exports = { enterHelpWithFees, enterHelpWithFeesCy };
