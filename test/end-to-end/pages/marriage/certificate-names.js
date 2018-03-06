function enterMarriageCertificateDetails() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/names-on-certificate');
  I.fillField('marriagePetitionerName', 'John Doe');
  I.fillField('marriageRespondentName', 'Jenny Benny');
  I.click('Continue');
}

module.exports = { enterMarriageCertificateDetails };