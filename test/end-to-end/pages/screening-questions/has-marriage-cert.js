const contentEn = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.en.translation.content;
const contentCy = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.cy.translation.content;

const pagePath = '/screening-questions/marriage-certificate';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function haveMarriageCert(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const marriageCertContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(marriageCertContent.yes);
  // I.moveCursorTo('input[name=submit]');
  I.scrollPageToBottom();
  I.click(commonContent.continue);
}

function haveNoMarriageCert() {
  const I = this;

  I.seeInCurrentUrl(pagePath);
  I.checkOption(contentEn.no);
  I.navByClick('Continue');
}

module.exports = { haveMarriageCert, haveNoMarriageCert };
