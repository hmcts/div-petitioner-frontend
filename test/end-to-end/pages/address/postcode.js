const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterAddressUsingPostcode(language = 'en', stepUrl, testAddressIndex) {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const findAddress = language === 'en' ? 'Find address' : 'Dod o hyd i gyfeiriad';

  const I = this;
  if (!testAddressIndex) {
    testAddressIndex = '0';
  }
  I.waitInUrl(stepUrl);
  I.seeInCurrentUrl(stepUrl);
  I.fillField('postcode', 'SW9 9PE');
  I.navByClick(findAddress);

  I.waitForVisible('#selectAddressIndex');
  I.selectOption('#selectAddressIndex', testAddressIndex);
  I.wait(4);
  I.waitForElement('#addressLine0');
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = { enterAddressUsingPostcode };
