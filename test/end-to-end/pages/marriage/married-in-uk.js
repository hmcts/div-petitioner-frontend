const content = require('app/steps/marriage/in-the-uk/content.json').resources.en.translation.content;

function selectMarriedInUk() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/in-the-uk');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

function selectMarriedElsewhere() {

  const I = this;

  I.seeCurrentUrlEquals('/about-your-marriage/in-the-uk');
  I.checkOption(content.no);
  I.navByClick('Continue');
}

module.exports = { selectMarriedInUk, selectMarriedElsewhere };