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

async function enterPetitionerAndRespondentNamesCy() {
  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');
  await I.navByClick('Parhau');
}

module.exports = { enterPetitionerAndRespondentNames, enterPetitionerAndRespondentNamesCy };
