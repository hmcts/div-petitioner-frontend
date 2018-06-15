const { mockSession } = require('test/fixtures');

function enterAdulteryDetails() {

  const I = this;

  I.waitUrlEquals('/about-divorce/reason-for-divorce/adultery/details');
  I.fillField('reasonForDivorceAdulteryDetails', mockSession.reasonForDivorceAdulteryDetails);
  I.navByClick('Continue');
  I.waitUrlEquals('/about-divorce/legal-proceedings');
}

module.exports = { enterAdulteryDetails };
