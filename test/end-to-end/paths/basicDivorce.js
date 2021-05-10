const language = 'en';
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

Feature('Basic divorce path');

Scenario('Get a divorce', async function(I) {

  I.amOnLoadedPage('/');
  I.startApplication(language);
  I.wait(1);
  I.languagePreference(language);
  I.haveBrokenMarriage(language);
  I.haveRespondentAddress(language);
  I.haveMarriageCert(language);

  I.readFinancialRemedy(language);
  I.selectHelpWithFees(language);
  I.enterHelpWithFees(language);
  I.selectDivorceType(language);
  I.enterMarriageDate(language);

  I.selectMarriedInUk(language);

  I.chooseBothHabituallyResident(language);
  I.chooseJurisdictionInterstitialContinue(language);

  I.enterPeConfidentialContactDetails(language);
  I.enterPetitionerAndRespondentNames(language);
  I.enterMarriageCertificateDetails(language);
  I.enterPetitionerChangedName(language);
  I.enterPetitionerContactDetails(language);

  I.enterAddressUsingPostcode(language,'/petitioner-respondent/address');
  I.enterCorrespondence(language);
  I.selectLivingTogetherInSameProperty(language);

  I.chooseRespondentServiceAddress(language);
  I.enterAddressUsingPostcode(language,'/petitioner-respondent/respondent-correspondence-address');
  I.selectReasonForDivorce(language, 'Behaviour');
  I.enterUnreasonableBehaviourExample(language);

  I.enterLegalProceedings(language);
  I.selectFinancialArrangements(language);
  I.enterFinancialAdvice(language);
  I.enterClaimCosts(language);

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFile(language);
  } else {
    const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(language, isDragAndDropSupported);
  }

  await I.completeEquality(language);

  if (parseBool(config.features.ignoreSessionValidation)) {
    I.checkMyAnswers(language);
  } else{
    await I.checkMyAnswersAndValidateSession(language);
  }
  I.amDoneAndSubmitted(language);

}).retry(2);
