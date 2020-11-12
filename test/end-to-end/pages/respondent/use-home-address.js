const content = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/respondent-correspondence/use-home-address';

function chooseRespondentServiceAddress(option) {

  const I = this;
  I.waitInUrl(pagePath);
  I.seeCurrentUrlEquals(pagePath);
  I.waitForText(content.yes);
  I.checkOption(option || content.no);
  I.navByClick('Continue');
}

module.exports = { chooseRespondentServiceAddress };
