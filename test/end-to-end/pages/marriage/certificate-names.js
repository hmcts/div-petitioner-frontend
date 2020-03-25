const pagePath = '/petitioner-respondent/names-on-certificate';

function enterMarriageCertificateDetails() {
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.navByClick('Continue');
}

module.exports = { enterMarriageCertificateDetails };