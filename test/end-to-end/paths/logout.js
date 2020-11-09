const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');
const language ='en';

Feature('Logout Session @functional').retry(2);

Scenario('Logout on Save and close', function (I) {
  I.amOnLoadedPage('/index');

  I.startApplication();

  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();

  I.clickSaveAndCLose();
  I.seeCurrentUrlEquals('/exit/application-saved');

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }

  I.navByClick('Back');
  I.startApplication();
});

Scenario('Logout on Sign Out', function (I) {
  I.amOnLoadedPage('/');

  I.startApplication();

  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();

  I.signOut(language);

  I.see('Sign in');

  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
});
