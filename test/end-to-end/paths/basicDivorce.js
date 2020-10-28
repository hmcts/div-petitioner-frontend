const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

Feature('Basic divorce path');

Scenario('Get a divorce', async function(I) {

  I.amOnPage('/index');
  I.startApplication();
  I.wait(1);
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.readFinancialRemedy();
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

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFile();
  } else {
    const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(isDragAndDropSupported);
  }

  await I.completeEquality();

  if (parseBool(config.features.ignoreSessionValidation)) {
    I.checkMyAnswers();
  } else{
    await I.checkMyAnswersAndValidateSession();
  }
  I.amDoneAndSubmitted();

}).retry(2);
