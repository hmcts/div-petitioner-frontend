const content = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.cy.translation.content;
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

async function haveMarriageCertCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.yes);
  // I.moveCursorTo('input[name=submit]');
  I.scrollPageToBottom();
  I.navByClick('Parhau');
}

module.exports = { haveMarriageCert, haveNoMarriageCert, haveMarriageCertCy };
