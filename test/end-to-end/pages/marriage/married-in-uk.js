const contentEn = require('app/steps/marriage/in-the-uk/content.json').resources.en.translation.content;
const contentCy = require('app/steps/marriage/in-the-uk/content.json').resources.cy.translation.content;
const pagePath = '/about-your-marriage/in-the-uk';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;


function selectMarriedInUk(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const stepContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(stepContent.yes);
  I.click(commonContent.continue);
}

function selectMarriedElsewhere() {

  const I = this;

  I.seeInCurrentUrl('/about-your-marriage/in-the-uk');
  I.checkOption(contentEn.no);
  I.navByClick('Continue');
}

module.exports = { selectMarriedInUk, selectMarriedElsewhere };
