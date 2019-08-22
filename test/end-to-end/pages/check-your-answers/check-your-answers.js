const content = require('app/steps/check-your-answers/content.json').resources.en.translation.content;
const jurisdictionContent = require('app/services/jurisdiction/content.json').resources.en.translation.content;
const getOtherConnections = require('test/end-to-end/helpers/GeneralHelpers.js').getOtherJurisdictionConnections;
const pagePath = '/check-your-answers';

function* checkMyConnectionsAre(...connections) { // eslint-disable-line require-yield

  const I = this;

  I.seeCurrentUrlEquals('/check-your-answers');
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

function checkMyAnswers() {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.see(content.title);

  I.retry(2).checkOption(content.confirmApply);

  I.navByClick(content.submitOnline);
}

function checkMyAnswersAndValidateSession() {

  const I = this;

  I.seeCurrentUrlEquals('/check-your-answers');
  I.see(content.title);

  // Verify static session data still valid
  I.assertSessionEqualsMockTestData();

  I.checkMyAnswers();
}

function checkMyAnswersRestoredSession() {
  const I = this;

  I.seeCurrentUrlEquals('/check-your-answers');
  I.see(content.titleSoFar);
  I.see(content.continueApplication);

  I.navByClick(content.continueApplication);
}

function checkMyAnswersRemoveApplication() {
  const I = this;

  I.seeCurrentUrlEquals('/check-your-answers');
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