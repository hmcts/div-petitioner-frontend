const contentEn = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const contentCy = require('app/steps/help/need-help/content.json').resources.cy.translation.content;

const pagePath = '/pay/help/need-help';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectHelpWithFees(language = 'en', needHelp = true) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const needHelpContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(needHelp ? needHelpContent.yes : needHelpContent.no);
  I.click(commonContent.continue);
}

module.exports = { selectHelpWithFees };
