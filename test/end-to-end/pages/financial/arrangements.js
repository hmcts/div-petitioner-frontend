const content = require('app/steps/financial/arrangements/content.json').resources.en.translation.content;
const contentCy = require('app/steps/financial/arrangements/content.json').resources.cy.translation.content;
const pagePath = '/about-divorce/financial/arrangements';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectFinancialArrangements(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  if (language === 'en') {
    I.retry(2).checkOption(content.yes);
    I.checkOption(content.petitioner);
    I.checkOption(content.children);
    I.navByClick(commonContent.continue);
  } else {
    I.retry(2).checkOption(contentCy.yes);
    I.checkOption(contentCy.petitioner);
    I.checkOption(contentCy.children);
    I.navByClick(commonContent.continue);
  }
}

module.exports = { selectFinancialArrangements };
