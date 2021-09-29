const pagePath = '/about-divorce/reason-for-divorce/reason';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectReasonForDivorce(language = 'en', reason) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);

  I.waitForText(reason);
  I.checkOption(reason);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}
module.exports = { selectReasonForDivorce };
