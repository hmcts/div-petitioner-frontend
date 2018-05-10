const content = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');

function enterHelpWithFees(appliedForFees = content.yes) {

  const I = this;

  I.seeCurrentUrlEquals('/pay/help/with-fees');
  I.click('#helpWithFeesAppliedForFees_' + appliedForFees);
  if (appliedForFees) {
    I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
  }
  I.navByClick('Continue');
}

module.exports = { enterHelpWithFees };
