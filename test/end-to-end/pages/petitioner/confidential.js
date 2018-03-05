const content = require('app/steps/petitioner/confidential/content.json').resources.en.translation.content;

function enterPeConfidentialContactDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
  I.checkOption(content.share);
  I.click('Continue');
}

module.exports = { enterPeConfidentialContactDetails };