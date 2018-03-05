const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;

Feature('Payment method');

Scenario('Card payment over phone (court calls petitioner)', function* (I) {

  const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
  if (!onlineSubmission) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    if (!onlineSubmission) {
      I.havePrinter();
    }
    I.selectHelpWithFees(false);
    I.selectDivorceType();
    I.amOnPage('/about-divorce/claim-costs');
    I.enterClaimCosts();
    if (onlineSubmission) {
      const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
      I.uploadMarriageCertificateFile(isDragAndDropSupported);
    }
    I.selectPaymentType('byCardOverPhoneCourt');
    I.enterPaymentContactDetails();
  }
  else {
    I.say('Online submission is enabled - skipping');
  }
});

Scenario('Cheque payment', function* (I) {

  const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');

  if (!onlineSubmission) {

    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.havePrinter();
    I.selectHelpWithFees(false);
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();

    const jurisdiction = yield I.getFeatureEnabled('jurisdiction');
    const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
    if (jurisdiction) {
      I.chooseJurisdictionResidence();
      I.chooseJurisdictionDomicile();
      I.chooseJurisdictionLast12Months();
      I.chooseJurisdictionLast6Months();
      I.chooseJurisdictionLastResort(true);
    }
    else if (newJurisdiction) {
      I.chooseBothHabituallyResident();
      I.chooseJurisdictionInterstitialContinue();
    }

    I.enterPeConfidentialContactDetails();
    I.enterPetitionerAndRespondentNames();
    I.enterMarriageCertificateDetails();
    I.enterPetitionerChangedName();
    I.enterPetitionerContactDetails();

    I.enterAddressUsingPostcode('/petitioner-respondent/address');
    I.enterCorrespondence();
    I.selectLivingTogetherInSameProperty();

    I.chooseRespondentServiceAddress();
    I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
    I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
    I.enterUnreasonableBehaviourExample();

    I.enterLegalProceedings();
    I.selectFinancialArrangements();
    I.enterFinancialAdvice();

    I.enterClaimCosts();
    I.selectPaymentType('byCheque');
    I.checkMyAnswers(onlineSubmission);
  }
  else {
    I.say('Online submission is enabled - skipping');
  }
});

Scenario('Card payment online', function* (I) {
  const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
  if (onlineSubmission) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees(false);
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();

    const jurisdiction = yield I.getFeatureEnabled('jurisdiction');
    const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
    if (jurisdiction) {
      I.chooseJurisdictionResidence();
      I.chooseJurisdictionDomicile();
      I.chooseJurisdictionLast12Months();
      I.chooseJurisdictionLast6Months();
      I.chooseJurisdictionLastResort(true);
    }
    else if (newJurisdiction) {
      I.chooseBothHabituallyResident();
      I.chooseJurisdictionInterstitialContinue();
    }

    I.enterPeConfidentialContactDetails();
    I.enterPetitionerAndRespondentNames();
    I.enterMarriageCertificateDetails();
    I.enterPetitionerChangedName();
    I.enterPetitionerContactDetails();

    I.enterAddressUsingPostcode('/petitioner-respondent/address');
    I.enterCorrespondence();
    I.selectLivingTogetherInSameProperty();

    I.chooseRespondentServiceAddress();
    I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
    I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
    I.enterUnreasonableBehaviourExample();

    I.enterLegalProceedings();
    I.selectFinancialArrangements();
    I.enterFinancialAdvice();

    I.enterClaimCosts();
    const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(isDragAndDropSupported);
    I.checkMyAnswers(onlineSubmission);
    I.confirmIWillPayOnline();
    const isPaymentOnStub = yield I.getPaymentIsOnStub();
    I.payOnPaymentPage(isPaymentOnStub);
    I.amDoneAndSubmitted();
  } else {
    I.say('Online submission is disabled - skipping');
  }
});


Scenario('Card payment online failure', function* (I) {
  const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
  if (onlineSubmission) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees(false);
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();

    const jurisdiction = yield I.getFeatureEnabled('jurisdiction');
    const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
    if (jurisdiction) {
      I.chooseJurisdictionResidence();
      I.chooseJurisdictionDomicile();
      I.chooseJurisdictionLast12Months();
      I.chooseJurisdictionLast6Months();
      I.chooseJurisdictionLastResort(true);
    }
    else if (newJurisdiction) {
      I.chooseBothHabituallyResident();
      I.chooseJurisdictionInterstitialContinue();
    }

    I.enterPeConfidentialContactDetails();
    I.enterPetitionerAndRespondentNames();
    I.enterMarriageCertificateDetails();
    I.enterPetitionerChangedName();
    I.enterPetitionerContactDetails();

    I.enterAddressUsingPostcode('/petitioner-respondent/address');
    I.enterCorrespondence();
    I.selectLivingTogetherInSameProperty();

    I.chooseRespondentServiceAddress();
    I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
    I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
    I.enterUnreasonableBehaviourExample();

    I.enterLegalProceedings();
    I.selectFinancialArrangements();
    I.enterFinancialAdvice();

    I.enterClaimCosts();
    const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(isDragAndDropSupported);
    I.checkMyAnswers(onlineSubmission);

    // Failure
    I.confirmIWillPayOnline();
    const isPaymentOnStub = yield I.getPaymentIsOnStub();
    I.payFailureOnPaymentPage(isPaymentOnStub);
    I.seeCurrentUrlEquals('/pay/online');

    // Retry
    I.confirmIWillPayOnline();
    I.payOnPaymentPage(isPaymentOnStub);
    I.amDoneAndSubmitted();

  } else {
    I.say('Online submission is disabled - skipping');
  }
});

Scenario('Card payment online cancellation with retry', function* (I) {
  const onlineSubmission = yield I.getFeatureEnabled('onlineSubmission');
  if (onlineSubmission) {
    I.amOnPage('/index');
    I.startApplication();
    I.haveBrokenMarriage();
    I.haveRespondentAddress();
    I.haveMarriageCert();
    I.selectHelpWithFees(false);
    I.selectDivorceType();
    I.enterMarriageDate();
    I.selectMarriedInUk();

    const jurisdiction = yield I.getFeatureEnabled('jurisdiction');
    const newJurisdiction = yield I.getFeatureEnabled('newJurisdiction');
    if (jurisdiction) {
      I.chooseJurisdictionResidence();
      I.chooseJurisdictionDomicile();
      I.chooseJurisdictionLast12Months();
      I.chooseJurisdictionLast6Months();
      I.chooseJurisdictionLastResort(true);
    }
    else if (newJurisdiction) {
      I.chooseBothHabituallyResident();
      I.chooseJurisdictionInterstitialContinue();
    }

    I.enterPeConfidentialContactDetails();
    I.enterPetitionerAndRespondentNames();
    I.enterMarriageCertificateDetails();
    I.enterPetitionerChangedName();
    I.enterPetitionerContactDetails();

    I.enterAddressUsingPostcode('/petitioner-respondent/address');
    I.enterCorrespondence();
    I.selectLivingTogetherInSameProperty();

    I.chooseRespondentServiceAddress();
    I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
    I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
    I.enterUnreasonableBehaviourExample();

    I.enterLegalProceedings();
    I.selectFinancialArrangements();
    I.enterFinancialAdvice();

    I.enterClaimCosts();
    const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(isDragAndDropSupported);
    I.checkMyAnswers(onlineSubmission);

    // Cancellation
    I.confirmIWillPayOnline();
    const isPaymentOnStub = yield I.getPaymentIsOnStub();
    I.cancelOnPaymentPage(isPaymentOnStub);
    I.seeCurrentUrlEquals('/pay/online');

    // Retry
    I.confirmIWillPayOnline();
    I.payOnPaymentPage(isPaymentOnStub);
    I.amDoneAndSubmitted();

  } else {
    I.say('Online submission is disabled - skipping');
  }
});
