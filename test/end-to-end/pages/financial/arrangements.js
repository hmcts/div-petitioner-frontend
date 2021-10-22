const contentEn = require('app/steps/financial/arrangements/content.json').resources.en.translation.content;
const contentCy = require('app/steps/financial/arrangements/content.json').resources.cy.translation.content;

const pagePath = '/about-divorce/financial/arrangements';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectFinancialArrangements(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const financialArrangements = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  I.retry(2).checkOption(financialArrangements.yes);
  I.checkOption(financialArrangements.petitioner);
  I.checkOption(financialArrangements.children);
  I.click(commonContent.continue);
}

module.exports = { selectFinancialArrangements };
