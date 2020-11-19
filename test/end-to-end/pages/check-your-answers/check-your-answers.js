const content = require('app/steps/check-your-answers/content.json').resources.en.translation.content;
const contentEn = require('app/steps/check-your-answers/content.json').resources.en.translation.content;
const contentCy = require('app/steps/check-your-answers/content.json').resources.cy.translation.content;
const jurisdictionContent = require('app/services/jurisdiction/content.json').resources.en.translation.content;
const getOtherConnections = require('test/end-to-end/helpers/GeneralHelpers.js').getOtherJurisdictionConnections;
const pagePath = '/check-your-answers';

function* checkMyConnectionsAre(...connections) { // eslint-disable-line require-yield

  const I = this;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.waitForElement('#jurisdiction-connections');

  connections.forEach((connection) => {
    let expectedFriendlyContent = jurisdictionContent['connection' + connection.toUpperCase()]
      .replace('{{ divorceWho }}', 'husband');
    let expectedLegalContent = jurisdictionContent['legal' + connection.toUpperCase()];

    I.see(expectedFriendlyContent, '#jurisdiction-connections');
    I.see(expectedLegalContent, '#jurisdiction-legal-connections');
  });

  let otherConnections = getOtherConnections(connections);
  otherConnections.forEach((unwantedConnection) => {
    let unwantedFriendlyContent = jurisdictionContent['connection' + unwantedConnection.toUpperCase()]
      .replace('{{ divorceWho }}', 'husband');
    let unwantedLegalContent = jurisdictionContent['legal' + unwantedConnection.toUpperCase()];

    I.dontSee(unwantedFriendlyContent, '#jurisdiction-connections');
    I.dontSee(unwantedLegalContent, '#jurisdiction-legal-connections');
  });

  return;
}

async function checkMyAnswers(language = 'en') {
  const checkYourAnswers = language === 'en' ? contentEn : contentCy;
  const I = this;
  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.see(checkYourAnswers.title);

  const browserName = await I.getBrowserName();
  if (browserName === 'safari') {
    // Safari 13 & Saucelabs doesn't handle scrolling properly, so need to forceClick()
    I.forceClick(checkYourAnswers.confirmApply);
  } else {
    I.retry(2).checkOption(checkYourAnswers.confirmApply);
  }

  await I.navByClick(checkYourAnswers.submitOnline);
}

async function checkMyAnswersAndValidateSession(language = 'en') {

  const I = this;

  I.waitInUrl(pagePath);
  if (language === 'en') {
    I.see(content.title);
    // Verify static session data still valid
    I.assertSessionEqualsMockTestData();
    await I.checkMyAnswers('en');
  } else {
    I.see(contentCy.title);
    await I.checkMyAnswers('cy');
  }
}

function checkMyAnswersRestoredSession() {
  const I = this;

  I.waitInUrl(pagePath);
  I.see(content.titleSoFar);
  I.see(content.continueApplication);

  I.navByClick(content.continueApplication);
}

function checkMyAnswersRemoveApplication() {
  const I = this;

  I.waitInUrl(pagePath);
  I.see(content.titleSoFar);
  I.see(content.deleteApplciation);

  I.navByClick(content.deleteApplciation);
}

module.exports = {
  checkMyAnswers,
  checkMyAnswersAndValidateSession,
  checkMyConnectionsAre,
  checkMyAnswersRestoredSession,
  checkMyAnswersRemoveApplication
};
