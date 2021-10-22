const contentEn = require('app/steps/petitioner/changed-name/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/changed-name/content.json').resources.cy.translation.content;

const pagePath = '/petitioner-respondent/changed-name';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterPetitionerChangedName(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const changedNameContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(changedNameContent.yes);
  I.checkOption(changedNameContent.marriageCertificate);
  I.click(commonContent.continue);
}

module.exports = { enterPetitionerChangedName };
