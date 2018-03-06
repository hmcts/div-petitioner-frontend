function confirmIWillPayOnline() {

  const I = this;

  I.seeCurrentUrlEquals('/pay/online');
  I.click('Continue');
}

module.exports = { confirmIWillPayOnline };