const toggleStore = require('test/end-to-end/helpers/featureToggleStore.js');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

Feature('Logout Session', { retries: 1 });

Scenario('Logount on Save and close', function (I) {
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

  I.navByClick('Back');
  I.startApplication();
});