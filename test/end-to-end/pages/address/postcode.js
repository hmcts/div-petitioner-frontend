function enterAddressUsingPostcode(stepUrl, testAddressIndex) {

  const I = this;
  if (!testAddressIndex) {
    testAddressIndex = '0';
  }
  I.waitInUrl(stepUrl, 5);
  I.seeCurrentUrlEquals(stepUrl);
  I.fillField('postcode', 'SW9 9PE');
  I.navByClick('Find address');
  I.waitForVisible('#selectAddressIndex');
  I.selectOption('#selectAddressIndex', testAddressIndex);
  I.wait(4);
  I.waitForElement('#addressLine0');
  I.wait(2);
  I.navByClick('Continue');
}

function enterAddressUsingPostcodeCy(stepUrl, testAddressIndex) {

  const I = this;
  if (!testAddressIndex) {
    testAddressIndex = '0';
  }
  I.waitInUrl(stepUrl, 5);
  I.seeInCurrentUrl(stepUrl);
  I.fillField('postcode', 'SW9 9PE');
  I.navByClick('Dod o hyd i gyfeiriad');
  I.waitForVisible('#selectAddressIndex');
  I.selectOption('#selectAddressIndex', testAddressIndex);
  I.wait(4);
  I.waitForElement('#addressLine0');
  I.wait(2);
  I.navByClick('Parhau');
}

module.exports = { enterAddressUsingPostcode, enterAddressUsingPostcodeCy };
