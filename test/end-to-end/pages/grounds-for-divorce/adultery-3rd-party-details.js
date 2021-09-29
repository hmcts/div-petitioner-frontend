const { mockSession } = require('test/fixtures');
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enter3rdPartyDetails(language ='en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/name-person');
  I.fillField('reasonForDivorceAdultery3rdPartyFirstName', mockSession.reasonForDivorceAdultery3rdPartyFirstName);
  I.fillField('reasonForDivorceAdultery3rdPartyLastName', mockSession.reasonForDivorceAdultery3rdPartyLastName);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = { enter3rdPartyDetails };
