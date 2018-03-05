const content = require('app/steps/marriage/where-married/content.json').resources.en.translation.content;

function selectCountryWhereMarried() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/country');
  I.checkOption(content.england);
  I.click('Continue');
}

module.exports = { selectCountryWhereMarried };