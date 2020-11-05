const contentEn = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const contentCy = require('app/steps/help/with-fees/content.json').resources.cy.translation.content;

const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const { mockSession } = require('test/fixtures');
const pagePath = '/pay/help/with-fees';

function enterHelpWithFees(language = 'en', appliedForFees = contentEn.yes) {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (language === 'en') {
    I.retry(2).click(contentEn.yes);
    if (appliedForFees) {
      I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
    }
    I.navByClick(commonContent.continue);

  } else {
    I.retry(2).click(contentCy.yes);
    if (appliedForFees) {
      I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
    }

    I.navByClick(commonContent.continue);
  }

}

module.exports = { enterHelpWithFees };
