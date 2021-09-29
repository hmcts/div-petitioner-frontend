const contentEn = require('app/steps/help/with-fees/content.json').resources.en.translation.content;
const contentCy = require('app/steps/help/with-fees/content.json').resources.cy.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const { mockSession } = require('test/fixtures');
const pagePath = '/pay/help/with-fees';

function enterHelpWithFees(language = 'en', appliedForFees = contentEn.yes) {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const feeContent = language === 'en' ? contentEn : contentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(feeContent.yes);

  if (appliedForFees) {
    I.fillField('helpWithFeesReferenceNumber', mockSession.helpWithFeesReferenceNumber);
  }
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = { enterHelpWithFees };
