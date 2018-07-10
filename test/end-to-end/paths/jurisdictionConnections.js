Feature('New Jurisdiction Journeys').retry(3);

Before((I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.selectHelpWithFees(false);
  I.selectDivorceType();
  I.enterMarriageDate();
  I.selectMarriedInUk();
});

Scenario('Set A & C: Both Habitually Resident', function(I) {
  I.chooseBothHabituallyResident();
  I.chooseJurisdictionInterstitialContinue();
  I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'C');
});

Scenario('Set All: Selected via Last Resort page', function(I) {
  I.chooseRespondentHabituallyResident();
  I.chooseJurisdictionInterstitialNeedInfo();
  I.chooseBothDomiciled();
  I.chooseYesLastHabitualResidence();
  I.checkMyConnectionSummaryIs('B', 'C', 'F');
  I.chooseJurisdictionConnectionSummaryShowAll();
  I.chooseMyLastResortConnections('A', 'B', 'C', 'D', 'E', 'F', 'G');
  I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('A', 'B', 'C', 'D', 'E', 'F', 'G');
});

Scenario('Re-set connections: Not confident at Connection Summary 1st time', function(I) {
  I.choosePetitionerHabituallyResident();
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
  I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyConnectionsAre('G');
});

Scenario('Jurisdiction Exit: Petitioner does not have eligible jurisdiction.', function(I) {
  I.choosePetitionerHabituallyResident();
  I.chooseNoJurisdictionLastTwelveMonths();
  I.choosePetitionerDomiciled();
  I.chooseNoJurisdictionLastSixMonths();
  I.chooseNoLastHabitualResidence();
  I.chooseNoForResidualJurisdiction();
  I.seeCurrentUrlEquals('/exit/jurisdiction/no-cnnections');
});
