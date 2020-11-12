const content = require('app/steps/marriage/names/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/names';

function enterPetitionerAndRespondentNames() {
  const I = this;
  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.waitForText(content.question);
  I.retry(2).fillField('petitionerFirstName', 'John');
  I.fillField('petitionerLastName', 'Smith');
  I.fillField('respondentFirstName', 'Jane');
  I.fillField('respondentLastName', 'Jamed');
  I.navByClick('Continue');
}

module.exports = { enterPetitionerAndRespondentNames };
