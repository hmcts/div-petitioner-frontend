const toggleStore = require('test/end-to-end/helpers/featureToggleStore.js');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

Feature('Draft petition store', { retries: 1 });

Scenario('See the check your answers page if session restored from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  I.setCookie({name: 'mockRestoreSession', value: 'true'});
  I.seeCookie('mockRestoreSession');

  if (toggleStore.getToggle('idam')) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();
    
    I.clearCookie();
    I.amOnLoadedPage('/index');
  }

  I.startApplication();

  I.checkMyAnswersRestoredSession();

  I.seeCurrentUrlEquals('/jurisdiction/habitual-residence');
});

Scenario('Save and close', function (I) {
  I.amOnLoadedPage('/index');

  I.startApplication();

  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.clickSaveAndCLose();
  I.seeCurrentUrlEquals('/exit/application-saved');

  if (toggleStore.getToggle('idam')) {
    I.see(idamConfigHelper.getTestEmail());
  }
});

Scenario('Delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  I.setCookie({name: 'mockRestoreSession', value: 'true'});
  I.seeCookie('mockRestoreSession');

  if (toggleStore.getToggle('idam')) {
    I.startApplication();
    I.haveBrokenMarriage();
    
    I.clearCookie();
    I.amOnLoadedPage('/index');
  }

  I.startApplication();

  I.checkMyAnswersRemoveApplication();
  I.confirmRemoveApplication();

  I.seeCurrentUrlEquals('/exit/removed-saved-application');
});

Scenario('Decline to delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  I.setCookie({name: 'mockRestoreSession', value: 'true'});
  I.seeCookie('mockRestoreSession');

  if (toggleStore.getToggle('idam')) {
    I.startApplication();
    I.haveBrokenMarriage();
    
    I.clearCookie();
    I.amOnLoadedPage('/index');
  }

  I.startApplication();

  I.checkMyAnswersRemoveApplication();
  I.declineRemoveApplicaiton();
  
  I.seeCurrentUrlEquals('/check-your-answers');
});