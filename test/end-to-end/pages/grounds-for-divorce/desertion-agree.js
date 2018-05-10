const content = require('app/steps/grounds-for-divorce/desertion/agree/content.json').resources.en.translation.content;

function enterDesertionAgreement() {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/desertion/agree');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { enterDesertionAgreement };