function enterAddressManually(stepUrl) {

  const I = this;

  I.seeCurrentUrlEquals(stepUrl);
  I.click('#enter-manual');
  I.fillField('addressManual', 'some address entered manually');
  I.click('Continue');
}
module.exports = { enterAddressManually };