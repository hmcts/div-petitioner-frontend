const content = require('app/steps/screening-questions/need-welsh/content.json').resources.en.translation.content;

function needWelsh() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/need-welsh');
  I.retry(2).click(content.yes);
  I.navByClick('Continue');
}

module.exports = { needWelsh };
