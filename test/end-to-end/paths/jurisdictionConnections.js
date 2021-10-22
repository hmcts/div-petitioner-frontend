const language = 'en';
Feature('New Jurisdiction Journeys @functional').retry(3);

Scenario('Set A & C: Both Habitually Resident', async I => {
  await completeLoginPageToSelectMarriedInUk(I);
  I.chooseBothHabituallyResident(language);
  I.chooseJurisdictionInterstitialContinue();
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'C');
});

Scenario('Set All: Selected via Last Resort page', async I => {
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
});

Scenario('Re-set connections: Not confident at Connection Summary 1st time', async I => {
  await completeLoginPageToSelectMarriedInUk(I);
  I.choosePetitionerHabituallyResident(language);
  I.chooseYesJurisdictionLastTwelveMonths();
  I.chooseJurisdictionInterstitialNeedInfo();
  I.chooseBothDomiciled();
  I.chooseYesLastHabitualResidence();
  I.checkMyConnectionSummaryIs('B', 'D', 'E', 'F');
  I.chooseJurisdictionConnectionSummaryNeedInfo();
  I.say('I want to change my answers');

  I.chooseNeitherHabituallyResident(language);
  I.chooseRespondentDomiciled();
  I.chooseNoLastHabitualResidence();
  I.chooseJurisdictionConnectionSummaryShowAll();
  I.checkMyConnectionSummaryIs('G');
  I.chooseMyLastResortConnections('D');
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('G');
});

Scenario('Jurisdiction Exit: Petitioner does not have eligible jurisdiction.', async I => {
  await completeLoginPageToSelectMarriedInUk(I);
  I.choosePetitionerHabituallyResident(language);
  I.chooseNoJurisdictionLastTwelveMonths();
  I.chooseNeitherDomiciled();
  I.chooseNoLastHabitualResidence();
  I.seeInCurrentUrl('/exit/jurisdiction/no-cnnections');
});

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
