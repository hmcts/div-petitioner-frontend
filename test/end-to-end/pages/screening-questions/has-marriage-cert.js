const content = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.en.translation.content;
const pagePath = '/screening-questions/marriage-certificate';

function haveMarriageCert() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.yes);
  I.moveCursorTo('input[name=submit]');
  I.scrollPageToBottom();
  I.navByClick('Continue');
}

function haveNoMarriageCert() {

  const I = this;

  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.no);
  I.navByClick('Continue');
}

module.exports = { haveMarriageCert, haveNoMarriageCert };