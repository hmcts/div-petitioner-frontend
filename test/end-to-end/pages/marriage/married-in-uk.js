const content = require('app/steps/marriage/in-the-uk/content.json').resources.en.translation.content;

function selectMarriedInUk() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/in-the-uk');
  I.checkOption(content.yes);
  I.click('Continue');
}

function selectMarriedElsewhere() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/in-the-uk');
  I.checkOption(content.no);
  I.click('Continue');
}

module.exports = { selectMarriedInUk, selectMarriedElsewhere };