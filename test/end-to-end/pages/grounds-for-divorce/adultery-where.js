const contentEn = require('app/steps/grounds-for-divorce/adultery/where/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/adultery/where/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectAdulteryWhere(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const stepContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/where');
  I.checkOption(stepContent.no);
  I.click(commonContent.continue);

}

module.exports = { selectAdulteryWhere };
