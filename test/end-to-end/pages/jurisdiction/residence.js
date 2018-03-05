const content = require('app/steps/jurisdiction/residence/content.json').resources.en.translation.content;

function chooseJurisdictionResidence() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/residence');
  I.checkOption(content.onlyMe);
  I.click('Continue');
}

module.exports = { chooseJurisdictionResidence };