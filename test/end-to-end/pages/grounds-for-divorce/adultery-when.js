const content = require('app/steps/grounds-for-divorce/adultery/when/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/adultery/when/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectAdulteryWhen(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;
  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/when');

  if (language === 'en') {
    I.checkOption(content.no);
    I.navByClick(commonContent.continue);
  } else {
    I.checkOption(contentCy.no);
    I.navByClick(commonContent.continue);
  }

}

module.exports = { selectAdulteryWhen };
