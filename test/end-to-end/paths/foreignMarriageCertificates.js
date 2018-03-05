Feature('Foreign Marriage Certificates');

Scenario('Certificate in English ', function*(I) {
  const foreignMarriageCerts = yield I.getFeatureEnabled('foreignMarriageCerts');

  if (foreignMarriageCerts) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
    if (!onlineSubmission) {
      I.havePrinter();
    }
    I.selectHelpWithFees();
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();

    I.selectMarriedElsewhere();
    I.selectMarriageCertificateInEnglish();
    I.enterCountryAndPlaceOfMarriage();
    I.seeCurrentUrlEquals('/njurisdiction/habitual-residence');
  } else {
    I.say('Feature disabled - skipping');
  }
});

Scenario('Certificate not English but with translation', function*(I) {
  const foreignMarriageCerts = yield I.getFeatureEnabled('foreignMarriageCerts');

  if (foreignMarriageCerts) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
    if (!onlineSubmission) {
      I.havePrinter();
    }
    I.selectHelpWithFees();
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();

    I.selectMarriedElsewhere();
    I.selectMarriageCertificateNotEnglishWithTranslation();
    I.enterCountryAndPlaceOfMarriage();
    I.seeCurrentUrlEquals('/njurisdiction/habitual-residence');
  } else {
    I.say('Feature disabled - skipping');
  }
});

Scenario('Certificate not English with no translation - exit page', function*(I) {
  const foreignMarriageCerts = yield I.getFeatureEnabled('foreignMarriageCerts');

  if (foreignMarriageCerts) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
    if (!onlineSubmission) {
      I.havePrinter();
    }
    I.selectHelpWithFees();
    I.enterHelpWithFees();
    I.selectDivorceType();
    I.enterMarriageDate();

    I.selectMarriedElsewhere();
    I.selectMarriageCertificateNotEnglishNoTranslation();
    I.seeCurrentUrlEquals('/exit/about-your-marriage/no-certificate-translated');
  } else {
    I.say('Feature disabled - skipping');
  }
});