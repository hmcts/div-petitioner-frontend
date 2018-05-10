function enterPetitionerAndRespondentNames() {
  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/names');
  I.fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');
  I.navByClick('Continue');
}

module.exports = { enterPetitionerAndRespondentNames };