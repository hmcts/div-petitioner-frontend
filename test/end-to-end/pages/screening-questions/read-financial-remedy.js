const pagePath = '/screening-questions/financial-remedy';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function readFinancialRemedy(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.navByClick(commonContent.continue);
}

module.exports = { readFinancialRemedy };
