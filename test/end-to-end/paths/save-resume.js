const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');
const language = 'en';

Feature('Draft petition store @functional').retry(3);

Scenario('See the check your answers page if session restored from draft petition store', function (I) {
  I.amOnLoadedPage('/');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.languagePreference();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.readFinancialRemedy();
    I.selectHelpWithFees(language);
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();
    I.clearCookie();

    I.amOnLoadedPage('/');
  } else {
    I.setCookie({ name: 'mockRestoreSession', value: 'true' });
    I.seeCookie('mockRestoreSession');
  }

  I.startApplication();

  I.checkMyAnswersRestoredSession();

  I.seeInCurrentUrl('/jurisdiction/habitual-residence');
});

Scenario('Save and close', function (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();
  I.selectHelpWithFees(language);

  I.clickSaveAndClose();
  I.seeInCurrentUrl('/exit/application-saved');

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }
});

Scenario('Delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.languagePreference();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.readFinancialRemedy();
    I.selectHelpWithFees(language);
    I.clearCookie();

    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({ name: 'mockRestoreSession', value: 'true' });
    I.seeCookie('mockRestoreSession');
  }

  I.startApplicationWith('basicDivorceSessionData');
  I.checkMyAnswersRemoveApplication();
  I.confirmRemoveApplication();
  I.seeInCurrentUrl('/exit/removed-saved-application');
});

Scenario('I delete my amend petition from draft store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.languagePreference();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.readFinancialRemedy();
    I.selectHelpWithFees(language);
    I.clearCookie();

    I.amOnLoadedPage('/');
  } else {
    I.setCookie({ name: 'mockRestoreSession', value: 'true' });
    I.seeCookie('mockRestoreSession');
  }

  I.startApplicationWith('amendPetitionSession');
  I.checkMyAnswersRemoveApplication();
  I.confirmRemoveApplication();
  I.seeInCurrentUrl('/exit/removed-saved-application');
});

Scenario('I do not delete my amend petition from draft store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.languagePreference();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.readFinancialRemedy();
    I.selectHelpWithFees(language);
    I.clearCookie();

    I.amOnLoadedPage('/index');
  } else {
    I.setCookie({ name: 'mockRestoreSession', value: 'true' });
    I.seeCookie('mockRestoreSession');
  }

  I.startApplicationWith('amendPetitionSession');
  I.checkMyAnswersRemoveApplication();
  I.declineRemoveApplicaiton();

  I.seeInCurrentUrl('/check-your-answers');
});

Scenario('Decline to delete application from draft petition store', function (I) {
  I.amOnLoadedPage('/index');

  if (parseBool(CONF.features.idam)) {
    I.startApplication();
    I.languagePreference();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.readFinancialRemedy();
    I.selectHelpWithFees(language);
    I.clearCookie();

    I.amOnLoadedPage('/');
  } else {
    I.setCookie({ name: 'mockRestoreSession', value: 'true' });
    I.seeCookie('mockRestoreSession');
  }

  I.startApplication();

  I.checkMyAnswersRemoveApplication();
  I.declineRemoveApplicaiton();

  I.seeInCurrentUrl('/check-your-answers');
});
