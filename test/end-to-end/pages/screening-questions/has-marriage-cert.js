const content = require('app/steps/screening-questions/has-marriage-cert/content.json').resources.en.translation.content;

function haveMarriageCert() {

  const I = this;

  I.waitUrlEquals('/screening-questions/marriage-certificate');
  I.checkOption(content.yes);
  I.navByClick('Continue');
}

module.exports = { haveMarriageCert };