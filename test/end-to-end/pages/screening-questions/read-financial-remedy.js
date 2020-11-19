const pagePath = '/screening-questions/financial-remedy';
const contentEn = require('app/steps/screening-questions/financial-remedy/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/financial-remedy/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function readFinancialRemedy(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const financialRemedyContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.waitForText(financialRemedyContent.settlingYourFinances);
  I.navByClick(commonContent.continue);
}

module.exports = { readFinancialRemedy };
