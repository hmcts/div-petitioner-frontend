const { mockSession } = require('test/fixtures');

function enterAdulteryDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/details');
  I.fillField('reasonForDivorceAdulteryDetails', mockSession.reasonForDivorceAdulteryDetails);
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
}

module.exports = { enterAdulteryDetails };
