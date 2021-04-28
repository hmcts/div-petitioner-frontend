const contentEn = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/confidential/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/confidential';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterPeConfidentialContactDetails(language = 'en', shareAddress = true) {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const confidentialContent = language === 'en' ? contentEn : contentCy;

  const I = this;
  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  I.retry(2).checkOption(shareAddress ? confidentialContent.share : confidentialContent.keep);
  I.scrollPageToBottom();
  I.retry(3).click(commonContent.continue);
}

module.exports = { enterPeConfidentialContactDetails };
