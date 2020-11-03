const pagePath = '/petitioner-respondent/names-on-certificate';

function enterMarriageCertificateDetails() {
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.navByClick('Continue');
}

async function enterMarriageCertificateDetailsCy() {
  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  await I.navByClick('Parhau');
}

module.exports = { enterMarriageCertificateDetails, enterMarriageCertificateDetailsCy };
