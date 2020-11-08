const language = 'en';
Feature('New Jurisdiction Journeys @functional').retry(3);

Before((I) => {
  I.amOnLoadedPage('/');
  I.startApplication(language);
  I.languagePreference(language);
  I.haveBrokenMarriage(language);
  I.haveRespondentAddress(language);
  I.haveMarriageCert(language);

  I.readFinancialRemedy(language);
  I.selectHelpWithFees(language, false);
  I.selectDivorceType(language);
  I.enterMarriageDate(language);
  I.selectMarriedInUk(language);
});

Scenario('Set A & C: Both Habitually Resident', function(I) {
  I.chooseBothHabituallyResident(language);
  I.chooseJurisdictionInterstitialContinue(language);
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'C');
});

Scenario('Set All: Selected via Last Resort page', function(I) {
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

Scenario('Re-set connections: Not confident at Connection Summary 1st time', function(I) {
  I.choosePetitionerHabituallyResident(language);
  I.chooseYesJurisdictionLastTwelveMonths();
  I.chooseJurisdictionInterstitialNeedInfo();
  I.chooseBothDomiciled();
  I.chooseYesLastHabitualResidence();
  I.checkMyConnectionSummaryIs('B', 'D', 'E', 'F');
  I.chooseJurisdictionConnectionSummaryNeedInfo();
  I.chooseNeitherHabituallyResident();
  I.chooseRespondentDomiciled();
  I.chooseNoLastHabitualResidence();
  I.chooseYesForResidualJurisdiction();
  I.checkMyConnectionSummaryIs('G');
  I.chooseJurisdictionConnectionSummaryContinue();
  I.seeInCurrentUrl('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('G');
});

Scenario('Jurisdiction Exit: Petitioner does not have eligible jurisdiction.', function(I) {
  I.choosePetitionerHabituallyResident(language);
  I.chooseNoJurisdictionLastTwelveMonths();
  I.choosePetitionerDomiciled();
  I.chooseNoJurisdictionLastSixMonths();
  I.chooseNoLastHabitualResidence();
  I.chooseNoForResidualJurisdiction();
  I.seeInCurrentUrl('/exit/jurisdiction/no-cnnections');
});
