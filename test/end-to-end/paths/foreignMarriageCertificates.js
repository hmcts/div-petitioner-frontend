Feature('Foreign Marriage Certificates @functional').retry(5);

Scenario('Certificate in English ', function(I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.readFinancialRemedy();
  I.selectHelpWithFees();
  I.enterHelpWithFees();
  I.selectDivorceType();
  I.enterMarriageDate();

  I.selectMarriedElsewhere();
  I.selectMarriageCertificateInEnglish();
  I.enterCountryAndPlaceOfMarriage();
  I.seeInCurrentUrl('/jurisdiction/habitual-residence');
});

Scenario('Certificate not English but with translation', function(I) {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.readFinancialRemedy();
  I.selectHelpWithFees();
  I.enterHelpWithFees();
  I.selectDivorceType();
  I.enterMarriageDate();

  I.selectMarriedElsewhere();
  I.selectMarriageCertificateNotEnglishWithTranslation();
  I.enterCountryAndPlaceOfMarriage();
  I.seeCurrentUrlEquals('/jurisdiction/habitual-residence');
});

Scenario('Certificate not English with no translation - exit page - and can go back', function(I) {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.readFinancialRemedy();
  I.selectHelpWithFees();
  I.enterHelpWithFees();
  I.selectDivorceType();
  I.enterMarriageDate();

  I.selectMarriedElsewhere();
  I.selectMarriageCertificateNotEnglishNoTranslation();
  I.seeInCurrentUrl('/exit/about-your-marriage/no-certificate-translated');
  I.navByClick('Back');
  I.selectMarriageCertificateInEnglish();
  I.enterCountryAndPlaceOfMarriage();
  I.seeInCurrentUrl('/jurisdiction/habitual-residence');
});
