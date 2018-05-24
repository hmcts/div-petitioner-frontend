const content = require('app/steps/respondent/solicitor/details/content.json').resources.en.translation.content;

function enterRespondentSolicitorDetails() {

  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/solicitor/details');
  I.fillField(content.name, 'Mrs. Smith');
  I.fillField(content.company, 'MoJ Solicitors');
  I.navByClick('Continue');
}

module.exports = { enterRespondentSolicitorDetails };