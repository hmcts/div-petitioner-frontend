const { mockSession } = require('test/fixtures');
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterDesertionDetails(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/desertion/details');
  I.fillField('reasonForDivorceDesertionDetails', mockSession.reasonForDivorceDesertionDetails);
  I.click(commonContent.continue);
}

module.exports = { enterDesertionDetails };
