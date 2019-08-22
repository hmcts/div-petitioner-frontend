const content = require('app/steps/petitioner/changed-name/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/changed-name';

function enterPetitionerChangedName() {
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.yes);
  I.checkOption(content.marriageCertificate);
  I.navByClick('Continue');
}

module.exports = { enterPetitionerChangedName };