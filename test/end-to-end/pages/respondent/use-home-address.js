const content = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/respondent-correspondence/use-home-address';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function chooseRespondentServiceAddress(language = 'en', option) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (language === 'en') {
    I.checkOption(option || content.no);
    I.navByClick(commonContent.continue);
  } else {
    I.checkOption(option || contentCy.no);
    I.navByClick(commonContent.continue);
  }
}

module.exports = { chooseRespondentServiceAddress };
