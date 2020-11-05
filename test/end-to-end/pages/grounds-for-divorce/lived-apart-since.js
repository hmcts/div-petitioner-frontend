const content = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/lived-apart-since/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectLivingApartTime(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/separation/lived-apart-since');

  if (language === 'en') {
    I.checkOption(content.yes);
    I.navByClick(commonContent.continue);
  } else {
    I.checkOption(contentCy.yes);
    I.navByClick(commonContent.continue);
  }
}

module.exports = { selectLivingApartTime };
