Feature('Exit route').retry(3);

Scenario('Reaching the have marriage certificate exit page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveNoMarriageCert();
  I.navByClick('Back');
  I.haveMarriageCert();

});