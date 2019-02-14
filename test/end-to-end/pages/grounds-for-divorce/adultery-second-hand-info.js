const { mockSession } = require('test/fixtures');
const content = require('app/steps/grounds-for-divorce/adultery/second-hand-information/content').resources.en.translation.content;

function enterAdulterySecondHandInfo() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/adultery/second-hand-information');
  I.click('#reasonForDivorceAdulterySecondHandInfo_' + content.yes);
  I.fillField('reasonForDivorceAdulterySecondHandInfoDetails', mockSession.reasonForDivorceAdulterySecondHandInfoDetails);
  I.navByClick('Continue');
  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
}

module.exports = { enterAdulterySecondHandInfo };