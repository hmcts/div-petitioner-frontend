const content = require('app/steps/pay/how/content.json').resources.en.translation.content;

function selectPaymentType(paymentMethod) {

  const I = this;

  I.seeCurrentUrlEquals('/pay/how');
  I.checkOption(content[paymentMethod]);
  I.click('Continue');
}

module.exports = { selectPaymentType };