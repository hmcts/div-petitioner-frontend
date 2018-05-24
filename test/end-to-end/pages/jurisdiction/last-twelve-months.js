const content = require('app/steps/jurisdiction/last-twelve-months/content.json').resources.en.translation.content;

function chooseYesJurisdictionLastTwelveMonths() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-twelve-months');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

function chooseNoJurisdictionLastTwelveMonths() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-twelve-months');
  I.checkOption(content.no);
  I.navByClick('Continue');
}

module.exports = { chooseYesJurisdictionLastTwelveMonths, chooseNoJurisdictionLastTwelveMonths };