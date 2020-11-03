const content = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.en.translation.content;
const contentCy = require('app/steps/respondent/correspondence/use-home-address/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/respondent-correspondence/use-home-address';

function chooseRespondentServiceAddress(option) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.checkOption(option || content.no);
  I.navByClick('Continue');
}

function chooseRespondentServiceAddressCy(option) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.checkOption(option || contentCy.no);
  I.navByClick('Parhau');
}

module.exports = { chooseRespondentServiceAddress, chooseRespondentServiceAddressCy };
