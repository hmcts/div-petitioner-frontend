const content = require('app/steps/help/with-fees/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');
const pagePath = '/pay/help/with-fees';

function enterHelpWithFees(appliedForFees = content.yes) {

  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.waitForText(content.question);
  I.retry(2).click(appliedForFees);
  if (appliedForFees) {
    I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
  }
  I.navByClick('Continue');
}

module.exports = { enterHelpWithFees };
