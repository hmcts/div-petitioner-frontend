const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;

Feature('Basic divorce path', { retries: 1 });

Scenario('Get a divorce', function*(I) {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.selectHelpWithFees();
  I.enterHelpWithFees();
  I.selectDivorceType();
  I.enterMarriageDate();

  I.selectMarriedInUk();

  I.chooseBothHabituallyResident();
  I.chooseJurisdictionInterstitialContinue();

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

  I.checkMyAnswers();

  I.amDoneAndSubmitted();

});