const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

Feature('Logout Session').retry(3);

Scenario('Logout on Save and close', I => {
  I.amOnLoadedPage('/index');

  I.startApplication();

  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();

  I.clickSaveAndClose();
  I.seeCurrentUrlEquals('/exit/application-saved');

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }

  I.navByClick('Back');
  I.startApplication();
});

Scenario('Logout on Sign Out', I => {
  I.amOnLoadedPage('/');

  I.startApplication();

  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();
  I.retry(3).signOut();

  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
});
