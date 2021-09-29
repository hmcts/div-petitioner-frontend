const contentEn = require('app/steps/prayer/claim-costs/content.json').resources.en.translation.content;
const contentCy = require('app/steps/prayer/claim-costs/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const pagePath = '/about-divorce/claim-costs';

function enterClaimCosts(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const claimCosts = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.checkOption(claimCosts.yes);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

function enterClaimCostsCorrespondent(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const claimCosts = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  I.checkOption(claimCosts.yes);
  I.checkOption( '#correspondent');
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);

}

module.exports = { enterClaimCosts, enterClaimCostsCorrespondent };
