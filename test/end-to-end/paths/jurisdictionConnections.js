const co = require('co');

Feature('New Jurisdiction Journeys');

Before((I) => {

  Promise.all([
    I.getFeatureEnabled('newJurisdiction'),
    I.getFeatureEnabled('onlineSubmission')
  ]).then((resolvedValues) => {

    const [newJurisdiction, onlineSubmission] = resolvedValues;

    if (newJurisdiction) {
      I.amOnPage('/index');
      I.startApplication();
      I.haveBrokenMarriage();
      I.haveRespondentAddress();
      I.haveMarriageCert();
      if (!onlineSubmission) {
        I.havePrinter();
      }
      I.selectHelpWithFees(false);
      I.selectDivorceType();
      I.enterMarriageDate();
    }
  });

  co(function* generator() {
    const foreignMarriageCerts = yield I.getFeatureEnabled('foreignMarriageCerts');

    (foreignMarriageCerts) ? I.selectMarriedInUk(): I.selectCountryWhereMarried();
  });
});

Scenario('Set A & C: Both Habitually Resident', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.chooseBothHabituallyResident();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('A', 'C');
  }
});

Scenario('Set B: Both Last Habitually Resident', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.chooseNeitherHabituallyResident();
    I.chooseNeitherDomiciled();
    I.chooseYesLastHabitualResidence();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('B');
  }
});

Scenario('Set C: Respondent Habitually Resident', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.chooseRespondentHabituallyResident();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('C');
  }
});

Scenario('Set D: Petitioner Habitually Resident 12 months', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseYesJurisdictionLastTwelveMonths();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('D');
  }
});

Scenario('Set E: Petitioner Habitually Resident less than 12 months, but Domiciled for at least six months', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseNoJurisdictionLastTwelveMonths();
    I.choosePetitionerDomiciled();
    I.chooseYesJurisdictionLastSixMonths();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('E');
  }
});

Scenario('Set F: Petitioner Habitually Resident less than 12 months, but Both Domiciled', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseNoJurisdictionLastTwelveMonths();
    I.chooseBothDomiciled();
    I.chooseJurisdictionInterstitialContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('F');
  }
});

Scenario('Set G: Petitioner has Residual Jurisdiction (long)', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseNoJurisdictionLastTwelveMonths();
    I.choosePetitionerDomiciled();
    I.chooseNoJurisdictionLastSixMonths();
    I.chooseNoLastHabitualResidence();
    I.chooseYesForResidualJurisdiction();
    I.checkMyConnectionSummaryIs('G');
    I.chooseJurisdictionConnectionSummaryContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('G');
  }
});


// COLLECTING MORE CONNECTIONS //

Scenario('Set B & E: Petitioner Habitually Resident and Domiciled for at least 6 months & Last Habitually Resident', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseNoJurisdictionLastTwelveMonths();
    I.choosePetitionerDomiciled();
    I.chooseYesJurisdictionLastSixMonths();
    I.chooseJurisdictionInterstitialNeedInfo();
    I.chooseYesLastHabitualResidence();
    I.checkMyConnectionSummaryIs('B', 'E');
    I.chooseJurisdictionConnectionSummaryContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('B', 'E');
  }
});

Scenario('Set A & C & D & E & F: Both Habitually Resident less than 12 months, and Both Domiciled for at least 6 months', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.chooseBothHabituallyResident();
    I.chooseJurisdictionInterstitialNeedInfo();
    I.chooseYesJurisdictionLastTwelveMonths();
    I.chooseBothDomiciled();
    I.checkMyConnectionSummaryIs('A', 'C', 'D', 'E', 'F');
    I.chooseJurisdictionConnectionSummaryContinue();
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('A', 'C', 'D', 'E', 'F');
  }
});

Scenario('Set A & D & E & F & G: Selected via Last Resort page', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.chooseRespondentHabituallyResident();
    I.chooseJurisdictionInterstitialNeedInfo();
    I.chooseBothDomiciled();
    I.chooseYesLastHabitualResidence();
    I.checkMyConnectionSummaryIs('B', 'C', 'F');
    I.chooseJurisdictionConnectionSummaryShowAll();
    I.chooseMyLastResortConnections('A', 'D', 'E', 'F', 'G');
    I.seeCurrentUrlEquals('/petitioner-respondent/confidential');
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('A', 'D', 'E', 'F', 'G');
  }
});

Scenario('Re-set connections: Not confident at Connection Summary 1st time', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
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
    I.amOnPage('/check-your-answers');
    I.checkMyConnectionsAre('G');
  }
});

Scenario('Jurisdiction Exit: Petitioner does not have eligible jurisdiction.', function*(I) {
  const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
  if (newJurisdiction) {
    I.choosePetitionerHabituallyResident();
    I.chooseNoJurisdictionLastTwelveMonths();
    I.choosePetitionerDomiciled();
    I.chooseNoJurisdictionLastSixMonths();
    I.chooseNoLastHabitualResidence();
    I.chooseNoForResidualJurisdiction();
    I.seeCurrentUrlEquals('/exit/njurisdiction/no-cnnections');
  }
});