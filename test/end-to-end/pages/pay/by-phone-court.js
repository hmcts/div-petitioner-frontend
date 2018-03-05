const content = require('app/steps/pay/by-phone-court/content.json').resources.en.translation.content;
const { mockSession } = require('test/fixtures');

function enterPaymentContactDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/pay/card-over-phone-court');
  I.fillField('paymentPhoneNumber', mockSession.paymentPhoneNumber);
  I.checkOption(content.callMorning);
  I.click('Continue');
}

module.exports = { enterPaymentContactDetails };
