Feature('Jurisdiction Exit');

Scenario('Exit screen', function*(I) {

  const jurisdiction = yield I.getFeatureEnabled('jurisdiction');
  if (jurisdiction) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.amOnPage('/jurisdiction/residence');
    I.chooseJurisdictionResidence();
    I.chooseJurisdictionDomicile();
    I.chooseJurisdictionLast12Months();
    I.chooseJurisdictionLast6Months();
    I.chooseJurisdictionLastResort(false);
  }
});