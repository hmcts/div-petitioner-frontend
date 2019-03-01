const content = require ('app/steps/pay/pay-online-only/content.json').resources.en.translation.content;
const feeContent = content.applicationFee.replace('{{ feeToBePaid }}', '550');

function confirmIWillPayOnline() {

  const I = this;

  I.seeCurrentUrlEquals('/pay/online');
  I.waitForText(feeContent);
  I.navByClick('Continue');
}

module.exports = { confirmIWillPayOnline };