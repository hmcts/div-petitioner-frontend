const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function confirmIWillPayOnline(language) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeCurrentUrlEquals('/pay/online');

  I.click(commonContent.continue);

}

module.exports = { confirmIWillPayOnline };
