const contentEn = require('app/steps/marriage/husband-or-wife/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/husband-or-wife/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const pagePath = '/about-your-marriage/details';

function selectDivorceType(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const husbandContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(husbandContent.husband);
  I.click(commonContent.continue);
}

module.exports = { selectDivorceType };
