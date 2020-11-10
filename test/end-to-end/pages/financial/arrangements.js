const content = require('app/steps/financial/arrangements/content.json').resources.en.translation.content;
const contentCy = require('app/steps/financial/arrangements/content.json').resources.cy.translation.content;
const pagePath = '/about-divorce/financial/arrangements';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectFinancialArrangements(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const stepContent = language === 'en' ? content : contentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.retry(2).checkOption(stepContent.yes);
  I.checkOption(stepContent.petitioner);
  I.checkOption(stepContent.children);
  I.navByClick(commonContent.continue);

}

module.exports = { selectFinancialArrangements };
