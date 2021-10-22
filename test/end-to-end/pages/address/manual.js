function enterAddressManually(stepUrl) {
  const I = this;

  I.seeInCurrentUrl(stepUrl);
  I.navByClick('#enter-manual');
  I.waitForVisible('#addressManual');
  I.fillField('addressManual', 'some address entered manually');
  I.navByClick('Continue');
}

module.exports = { enterAddressManually };
