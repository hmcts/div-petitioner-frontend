const content = require('app/steps/jurisdiction/last-6-months/content.json').resources.en.translation.content;

function chooseJurisdictionLast6Months() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/last-6-months');
  I.checkOption(content.no);
  I.click('Continue');
}

module.exports = { chooseJurisdictionLast6Months };