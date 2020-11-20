const language ='en';
Feature('New Jurisdiction Journeys @functional').retry(3);

Scenario('Set A & C: Both Habitually Resident', async function(I) {
  await completeLoginPageToSelectMarriedInUk(I);
  I.chooseBothHabituallyResident(language);
  I.chooseJurisdictionInterstitialContinue();
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'C');
});

Scenario('Set All: Selected via Last Resort page', async function(I) {
  await completeLoginPageToSelectMarriedInUk(I);
  I.chooseRespondentHabituallyResident(language);
  I.chooseJurisdictionInterstitialNeedInfo();
  I.chooseBothDomiciled();
  I.chooseYesLastHabitualResidence();
  I.checkMyConnectionSummaryIs('B', 'C', 'F');
  I.chooseJurisdictionConnectionSummaryShowAll();
  I.chooseMyLastResortConnections('A', 'B', 'C', 'D', 'E', 'F', 'G');
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'B', 'C', 'D', 'E', 'F', 'G');
}).retry(3);

xScenario('Re-set connections: Not confident at Connection Summary 1st time', async function(I) {
  await completeLoginPageToSelectMarriedInUk(I);
  I.choosePetitionerHabituallyResident(language);
  I.chooseYesJurisdictionLastTwelveMonths();
  I.chooseJurisdictionInterstitialNeedInfo();
  I.chooseBothDomiciled();
  I.chooseYesLastHabitualResidence();
  I.checkMyConnectionSummaryIs('B', 'D', 'E', 'F');
  I.chooseJurisdictionConnectionSummaryNeedInfo();
  I.chooseNeitherHabituallyResident(language);
  I.chooseRespondentDomiciled();
  I.chooseNoLastHabitualResidence();
  I.chooseYesForResidualJurisdiction();
  I.checkMyConnectionSummaryIs('G');
  I.chooseJurisdictionConnectionSummaryContinue();
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('G');
}).retry(3);

xScenario('Jurisdiction Exit: Petitioner does not have eligible jurisdiction.', async function(I) {
  await completeLoginPageToSelectMarriedInUk(I);
  I.choosePetitionerHabituallyResident(language);
  I.chooseNoJurisdictionLastTwelveMonths();
  I.choosePetitionerDomiciled();
  I.chooseNoJurisdictionLastSixMonths();
  I.chooseNoLastHabitualResidence();
  I.chooseNoForResidualJurisdiction();
  I.seeInCurrentUrl('/exit/jurisdiction/no-cnnections');
}).retry(3);

async function completeLoginPageToSelectMarriedInUk(I) {
  await I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();
  I.selectHelpWithFees(language, false);
  I.selectDivorceType();
  I.enterMarriageDate();
  I.selectMarriedInUk();
}
