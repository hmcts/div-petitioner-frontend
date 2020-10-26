const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const config = require('config');

Feature('Other reasons for divorce').retry(3);
Before((I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();
  I.readFinancialRemedy();
});

Scenario('Adultery, with details', async function(I) {
  I.selectHelpWithFees();
  I.enterHelpWithFees();
  I.selectDivorceType();
  I.enterMarriageDate();
  I.selectMarriedInUk();
  I.chooseBothHabituallyResident();
  I.chooseJurisdictionInterstitialContinue();
  I.enterPeConfidentialContactDetails(false);
  I.enterPetitionerAndRespondentNames();
  I.enterMarriageCertificateDetails();
  I.enterPetitionerChangedName();
  I.enterPetitionerContactDetails();
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.enterCorrespondence();
  I.selectLivingTogetherInSameProperty();
  I.chooseRespondentServiceAddress();
  I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
  I.selectReasonForDivorce(content['adulteryHeading']);
  I.selectWishToName();
  I.enter3rdPartyDetails();
  I.enterAddressUsingPostcode('/about-divorce/reason-for-divorce/adultery/co-respondent-address');
  I.selectAdulteryWhere();
  I.selectAdulteryWhen();
  I.enterAdulteryDetails();
  I.enterAdulterySecondHandInfo();
  I.enterLegalProceedings();
  I.selectFinancialArrangements();
  I.enterFinancialAdvice();
  I.enterClaimCostsCorrespondent();
  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFile();
  } else {
    const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(isDragAndDropSupported);
  }
  await I.completeEquality();
  I.checkMyAnswers();
  I.amDoneAndSubmitted();
}).retry(2);


Scenario('Deserted without agreement', async function(I) {
  // Fill out all of the application
  // to test CYA content the application must be complete and valid
  I.selectHelpWithFees(false);
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
  I.selectReasonForDivorce(content['desertionHeading']);
  I.enterDesertionAgreement();
  I.enterDesertionDate();
  I.selectLivingApartTime();
  I.enterDesertionDetails();
  I.enterLegalProceedings();
  I.selectFinancialArrangements();
  I.enterFinancialAdvice();
  I.enterClaimCosts();
  const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
  I.uploadMarriageCertificateFile(isDragAndDropSupported);
  await I.completeEquality();
  I.checkDesertionDateOnCYAPage();
  I.checkMyAnswers();
  I.confirmIWillPayOnline();
}).retry(2);

