function enterAddressUsingPostcode(stepUrl, testAddressIndex) {

  const I = this;
  if (!testAddressIndex) {
    testAddressIndex = '0';
  }
  I.seeCurrentUrlEquals(stepUrl);
  I.fillField('postcode', 'SW9 9PE');
  I.click('Find address');
  I.waitForVisible('#selectAddressIndex');
  I.selectOption('#selectAddressIndex', testAddressIndex);
  I.wait(3);
  I.waitForElement('#addressLine0');
  I.click('Continue');
}

module.exports = { enterAddressUsingPostcode };