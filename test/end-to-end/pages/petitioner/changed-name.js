const content = require('app/steps/petitioner/changed-name/content.json').resources.en.translation.content;
const contentCy = require('app/steps/petitioner/changed-name/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/changed-name';

function enterPetitionerChangedName() {
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.yes);
  I.checkOption(content.marriageCertificate);
  I.navByClick('Continue');
}

async function enterPetitionerChangedNameCy() {
  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.no);
  await I.navByClick('Parhau');
}

module.exports = { enterPetitionerChangedName, enterPetitionerChangedNameCy };
