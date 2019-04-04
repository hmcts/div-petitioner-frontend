const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

Feature('Draft petition store').retry(3);

Scenario('See the check your answers page if session restored from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
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

xScenario('See next unanswered question if toNextUnansweredPage=true in query string and session restored from draft petition store', async function (I) {
  let cookie = '';
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();
    cookie = await I.grabCookie('__auth-token');
    I.clearCookie();
    I.wait(2);
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
  }

  I.amOnLoadedPage(`/authenticated?toNextUnansweredPage=true&__auth-token=${cookie}`);

  I.seeCurrentUrlEquals('/jurisdiction/habitual-residence');
});

Scenario('Save and close', function (I) {
  I.amOnLoadedPage('/index');

  I.startApplication();

  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.selectHelpWithFees();

  I.clickSaveAndCLose();
  I.seeCurrentUrlEquals('/exit/application-saved');

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }
});

Scenario('Delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
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

Scenario('I delete my amend petition from draft store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
    I.clearCookie();

    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
  }

  I.startApplicationWith('amendPetitionSession');
  I.checkMyAnswersRemoveApplication();
  I.confirmRemoveApplication();
  I.seeCurrentUrlEquals('/exit/removed-saved-application');
});

Scenario('I do not delete my amend petition from draft store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
    I.clearCookie();

    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({name: 'mockRestoreSession', value: 'true'});
    I.seeCookie('mockRestoreSession');
  }

  I.startApplicationWith('amendPetitionSession');
  I.checkMyAnswersRemoveApplication();
  I.declineRemoveApplicaiton();

  I.seeCurrentUrlEquals('/check-your-answers');
});

Scenario('Decline to delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees();
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
