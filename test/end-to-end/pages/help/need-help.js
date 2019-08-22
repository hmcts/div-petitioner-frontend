const content = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const pagePath = '/pay/help/need-help';

function selectHelpWithFees(needHelp = true) {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(needHelp ? content.yes : content.no);
  I.navByClick('Continue');
}

module.exports = { selectHelpWithFees };