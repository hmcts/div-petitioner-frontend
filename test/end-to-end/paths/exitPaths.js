Feature('Exit route @functional').retry(5);

Scenario('Reaching the have marriage certificate exit page', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveNoMarriageCert();
  I.navByClick('Back');
  I.haveMarriageCert();
});
