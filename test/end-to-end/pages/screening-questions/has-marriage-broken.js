const content = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.en.translation.content;

function haveBrokenMarriage() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/has-marriage-broken');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { haveBrokenMarriage };