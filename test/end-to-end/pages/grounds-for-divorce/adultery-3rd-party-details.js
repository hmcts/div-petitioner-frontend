const { mockSession } = require('test/fixtures');

function enter3rdPartyDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/name-person');
  I.fillField('reasonForDivorceAdultery3rdPartyFirstName', mockSession.reasonForDivorceAdultery3rdPartyFirstName);
  I.fillField('reasonForDivorceAdultery3rdPartyLastName', mockSession.reasonForDivorceAdultery3rdPartyLastName);
  I.navByClick('Continue');
}

module.exports = { enter3rdPartyDetails };
