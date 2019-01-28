const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

Feature('Logout Session').retry(3);

Scenario('Logount on Save and close', function (I) {
  I.amOnLoadedPage('/index');

  I.startApplication();

  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.clickSaveAndCLose();
  I.seeCurrentUrlEquals('/exit/application-saved');

  if (parseBool(CONF.features.idam)) {
    I.see(idamConfigHelper.getTestEmail());
  }

  I.navByClick('Back');
  I.startApplication();
});