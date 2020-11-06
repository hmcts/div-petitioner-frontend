const pagePath = '/about-divorce/financial/advice';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterFinancialAdvice(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 3);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.navByClick(commonContent.continue);
  } else {
    I.navByClick(commonContent.continue);
  }
}
module.exports = { enterFinancialAdvice };
