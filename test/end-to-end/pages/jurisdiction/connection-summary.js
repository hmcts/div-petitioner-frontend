const connectionSummary = require('app/steps/jurisdiction/connection-summary/content.json').resources.en.translation.content;
const getOtherConnections = require('test/end-to-end/helpers/GeneralHelpers.js').getOtherJurisdictionConnections;

function* checkMyConnectionSummaryIs(...connections) { // eslint-disable-line require-yield 

  const I = this;
  const connectionSummaryList = 'form .text ul.list-bullet';

  I.seeCurrentUrlEquals('/jurisdiction/connection-summary');
  I.waitForElement('#connectionSummary');

  connections.forEach((connection) => {
    let expectedContent = connectionSummary['reason-' + connection.toUpperCase()];
    expectedContent = expectedContent.replace('{{divorceWho}}', 'husband');

    I.see(expectedContent, connectionSummaryList);
  });

  let otherConnections = getOtherConnections(connections);
  otherConnections.forEach((unwantedConnection) => {
    let unwantedContent = connectionSummary['reason-' + unwantedConnection.toUpperCase()];
    unwantedContent = unwantedContent.replace('{{divorceWho}}', 'husband');

    I.dontSee(unwantedContent, connectionSummaryList);
  });

  return;
}

function chooseJurisdictionConnectionSummaryContinue() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/connection-summary');
  I.checkOption(connectionSummary.confident);
  I.click('Continue');
}

function chooseJurisdictionConnectionSummaryNeedInfo() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/connection-summary');
  I.checkOption(connectionSummary.needInfo);
  I.click('Continue');
}

function chooseJurisdictionConnectionSummaryShowAll() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/connection-summary');
  I.checkOption(connectionSummary.showAll);
  I.click('Continue');
}

module.exports = {
  checkMyConnectionSummaryIs,
  chooseJurisdictionConnectionSummaryContinue,
  chooseJurisdictionConnectionSummaryNeedInfo,
  chooseJurisdictionConnectionSummaryShowAll
};