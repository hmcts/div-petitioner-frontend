const contentEn = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.cy.translation.content;

const pagePath = '/screening-questions/marriage-certificate';

function haveMarriageCert(language ,commonContent) {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (language === 'en') {
    I.retry(2).click(contentEn.yes);
    I.moveCursorTo('input[name=submit]');
    I.scrollPageToBottom();
    I.navByClick(commonContent.continue);
    I.wait(2);
  }else {
    I.retry(2).click(contentCy.yes);
    I.moveCursorTo('input[name=submit]');
    I.scrollPageToBottom();
    I.navByClick(commonContent.continue);
    I.wait(2);
  }

}

function haveNoMarriageCert() {

  const I = this;

  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(contentEn.no);
  I.navByClick('Continue');
}

module.exports = { haveMarriageCert, haveNoMarriageCert };
