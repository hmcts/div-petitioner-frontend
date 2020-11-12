const content = require('app/steps/marriage/certificate-names/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/names-on-certificate';

function enterMarriageCertificateDetails() {
  const I = this;

  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.waitForText(content.question);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.navByClick('Continue');
}

module.exports = { enterMarriageCertificateDetails };
