const content = require('app/steps/help/need-help/content.json').resources.en.translation.content;
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

module.exports = { enterHelpWithFees };
