const content = require('app/steps/help/need-help/content.json').resources.en.translation.content;

function selectHelpWithFees(needHelp = true) {

  const I = this;

  I.seeCurrentUrlEquals('/pay/help/need-help');
  I.checkOption(needHelp ? content.yes : content.no);
  I.navByClick('Continue');
}

module.exports = { selectHelpWithFees };