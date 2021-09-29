const contentEn = require('app/steps/grounds-for-divorce/adultery/wish-to-name/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/adultery/wish-to-name/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectWishToName(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const wishToName = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/wish-to-name');
  I.checkOption(wishToName.yes);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = { selectWishToName };
