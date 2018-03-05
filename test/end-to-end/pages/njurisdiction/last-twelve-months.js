const content = require('app/steps/njurisdiction/last-twelve-months/content.json').resources.en.translation.content;

function chooseYesJurisdictionLastTwelveMonths() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/last-twelve-months');
  I.checkOption(content.yes);
  I.click('Continue');
}

function chooseNoJurisdictionLastTwelveMonths() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/last-twelve-months');
  I.checkOption(content.no);
  I.click('Continue');
}

module.exports = { chooseYesJurisdictionLastTwelveMonths, chooseNoJurisdictionLastTwelveMonths };