const contentEn = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectLivingApartTime(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const livedApart = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/separation/lived-apart-since');
  I.checkOption(livedApart.yes);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = { selectLivingApartTime };
