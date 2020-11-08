const content = require ('app/steps/pay/pay-online-only/content.json').resources.en.translation.content;
const feeContent = content.applicationFee.replace('{{ feeToBePaid }}', '550');
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function confirmIWillPayOnline(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;
  I.seeInCurrentUrl('/pay/online');
  I.waitForText(feeContent);

  if (language === 'en') {
    I.navByClick(commonContent.continue);
  } else {
    I.navByClick(commonContent.continue);
  }
}

module.exports = { confirmIWillPayOnline };
