const content = require('app/steps/screening-questions/has-printer/content.json').resources.en.translation.content;

function havePrinter() {

  const I = this;

  I.seeCurrentUrlEquals('/screening-questions/printer');
  I.checkOption(content.yes);
  I.click('Continue');
}
module.exports = { havePrinter };