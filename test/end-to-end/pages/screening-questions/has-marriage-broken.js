const content = require('app/steps/screening-questions/has-marriage-broken/content.json').resources.en.translation.content;

function haveBrokenMarriage() {

  const I = this;

  I.waitInUrl('/screening-questions/has-marriage-broken');
  I.waitForText(content.question);
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

module.exports = { haveBrokenMarriage };
