function enterAddressManually(stepUrl) {

  const I = this;

  I.seeCurrentUrlEquals(stepUrl);
  I.navByClick('#enter-manual');
  I.fillField('addressManual', 'some address entered manually');
  I.navByClick('Continue');
}
module.exports = { enterAddressManually };