const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterAddressUsingPostcode(language = 'en', stepUrl, testAddressIndex) {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;

  const I = this;
  if (!testAddressIndex) {
    testAddressIndex = '0';
  }
  I.waitInUrl(stepUrl, 5);
  I.seeInCurrentUrl(stepUrl);
  I.fillField('postcode', 'SW9 9PE');

  I.navByClick(commonContent.findAddress);

  I.waitForVisible('#selectAddressIndex');
  I.selectOption('#selectAddressIndex', testAddressIndex);
  I.wait(4);
  I.waitForElement('#addressLine0');
  I.wait(2);

  I.navByClick(commonContent.continue);

}

module.exports = { enterAddressUsingPostcode };
