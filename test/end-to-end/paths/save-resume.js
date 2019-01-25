const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

Feature('Draft petition store').retry(3);

Scenario('See the check your answers page if session restored from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (CONF.features.idam) {
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
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
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

  if (CONF.features.idam) {
    I.see(idamConfigHelper.getTestEmail());
  }
});

Scenario('Delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (CONF.features.idam) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.clearCookie();
    
    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
  }

  I.startApplication();
  I.checkMyAnswersRemoveApplication();
  I.confirmRemoveApplication();
  I.seeCurrentUrlEquals('/exit/removed-saved-application');

  const ignoreIdam = true;
  I.amOnLoadedPage('/index');
  I.startApplication(ignoreIdam);
  I.seeCurrentUrlEquals('/screening-questions/has-marriage-broken');
});

Scenario('Decline to delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (CONF.features.idam) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.clearCookie();
    
    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
  }

  I.startApplication();

  I.checkMyAnswersRemoveApplication();
  I.declineRemoveApplicaiton();
  
  I.seeCurrentUrlEquals('/check-your-answers');
});