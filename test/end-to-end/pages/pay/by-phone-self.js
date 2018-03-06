function confirmIWillCallCourt() {

  const I = this;

  I.seeCurrentUrlEquals('/pay/card-over-phone-self');
  I.click('Continue');
}

module.exports = { confirmIWillCallCourt };