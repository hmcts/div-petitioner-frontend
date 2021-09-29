const { mockSession } = require('test/fixtures');
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterAdulteryDetails(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/details');
  I.fillField('reasonForDivorceAdulteryDetails', mockSession.reasonForDivorceAdulteryDetails);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/second-hand-information');
}

module.exports = { enterAdulteryDetails };
