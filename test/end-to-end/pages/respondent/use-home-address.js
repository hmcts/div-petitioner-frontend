const content = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.en.translation.content;

function chooseRespondentServiceAddress(option) {

  const I = this;

  I.seeCurrentUrlEquals('/petitioner-respondent/respondent-correspondence/use-home-address');
  I.checkOption(option || content.no);
  I.navByClick('Continue');
}

module.exports = { chooseRespondentServiceAddress };