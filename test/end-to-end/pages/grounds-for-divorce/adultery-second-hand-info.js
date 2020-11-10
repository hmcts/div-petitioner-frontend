const { mockSession } = require('test/fixtures');
const content = require('app/steps/grounds-for-divorce/adultery/second-hand-information/content').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/adultery/second-hand-information/content').resources.en.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function enterAdulterySecondHandInfo(language ='en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const stepContent = language === 'en' ? content : contentCy;
  const I = this;

  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/adultery/second-hand-information');

  I.click('#reasonForDivorceAdulterySecondHandInfo_' + stepContent.yes);
  I.fillField('reasonForDivorceAdulterySecondHandInfoDetails', mockSession.reasonForDivorceAdulterySecondHandInfoDetails);
  I.navByClick(commonContent.continue);
  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
}

module.exports = { enterAdulterySecondHandInfo };
