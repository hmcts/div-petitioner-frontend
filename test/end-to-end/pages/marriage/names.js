const pagePath = '/petitioner-respondent/names';

function enterPetitionerAndRespondentNames() {
  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');
  I.navByClick('Continue');
}

module.exports = { enterPetitionerAndRespondentNames };