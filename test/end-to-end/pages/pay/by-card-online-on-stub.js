const content = require ('app/steps/pay/gov-pay-stub/content.json').resources.en.translation.content;

function payOnStubPages(success = true) {

  const I = this;

  I.seeCurrentUrlEquals('/pay/gov-pay-stub');
  I.checkOption(success ? content.success : content.failure);
  I.navByClick('Continue');
}

module.exports = { payOnStubPages };
