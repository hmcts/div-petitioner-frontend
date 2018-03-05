const { mockSession } = require('test/fixtures');

function enterDesertionDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/desertion/details');
  I.fillField('reasonForDivorceDesertionDetails', mockSession.reasonForDivorceDesertionDetails);
  I.click('Continue');
}

module.exports = { enterDesertionDetails };
