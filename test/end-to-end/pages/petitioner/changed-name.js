const content = require('app/steps/petitioner/changed-name/content.json').resources.en.translation.content;

function enterPetitionerChangedName() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/changed-name');
  I.checkOption(content.yes);
  I.checkOption(content.marriageCertificate);
  I.navByClick('Continue');
}

module.exports = { enterPetitionerChangedName };