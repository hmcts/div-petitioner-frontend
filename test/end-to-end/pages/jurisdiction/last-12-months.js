const content = require('app/steps/jurisdiction/last-12-months/content.json').resources.en.translation.content;

function chooseJurisdictionLast12Months() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-12-months');
  I.checkOption(content.no);
  I.click('Continue');
}

module.exports = { chooseJurisdictionLast12Months };