const content = require('app/steps/prayer/claim-costs/content.json').resources.en.translation.content;
const contentCy = require('app/steps/prayer/claim-costs/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const pagePath = '/about-divorce/claim-costs';

function enterClaimCosts(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (language === 'en') {
    I.checkOption(content.yes);
    I.navByClick(commonContent.continue);
  } else {
    I.checkOption(contentCy.yes);
    I.navByClick(commonContent.continue);
  }

}

function enterClaimCostsCorrespondent() {

  const I = this;

  I.waitInUrl(pagePath, 3);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.yes);
  I.checkOption( '#correspondent');
  I.navByClick('Continue');
}

module.exports = { enterClaimCosts, enterClaimCostsCorrespondent };
