const contentEn = require('app/steps/grounds-for-divorce/desertion/agree/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/desertion/agree/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterDesertionAgreement(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const content = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/desertion/agree');
  I.checkOption(content.yes);
  I.click(commonContent.continue);
}

module.exports = { enterDesertionAgreement };
