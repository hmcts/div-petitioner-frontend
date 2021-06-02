const language = 'cy';
const divorceReason = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;

const config = require('config');

Feature('Adultery and Desertion E2E Tests (cy)').retry(3);

Scenario('Adultery, with details (cy)', async function (I) {

  await stepsStartApplicationToReadFinancialRemedy(I, language);

  I.selectHelpWithFees(language);
  I.enterHelpWithFees(language);
  I.selectDivorceType(language);
  I.enterMarriageDate(language);

  I.selectMarriedInUk(language);

  I.chooseBothHabituallyResident(language);
  I.chooseJurisdictionInterstitialContinue(language);

  I.enterPeConfidentialContactDetails(language, false);
  I.enterPetitionerAndRespondentNames(language);
  I.enterMarriageCertificateDetails(language);
  I.enterPetitionerChangedName(language);
  I.enterPetitionerContactDetails(language);

  I.enterAddressUsingPostcode(language, '/petitioner-respondent/address');
  I.enterCorrespondence(language);
  I.selectLivingTogetherInSameProperty(language);
  I.chooseRespondentServiceAddress(language);
  I.enterAddressUsingPostcode(language, '/petitioner-respondent/respondent-correspondence-address');

  I.selectReasonForDivorce(language, divorceReason['adulteryHeading']);
  I.selectWishToName(language);
  I.enter3rdPartyDetails(language);
  I.enterAddressUsingPostcode(language, '/about-divorce/reason-for-divorce/adultery/co-respondent-address');
  I.selectAdulteryWhere(language);
  I.selectAdulteryWhen(language);
  I.enterAdulteryDetails(language);
  I.enterAdulterySecondHandInfo(language);

  I.enterLegalProceedings(language);
  I.selectFinancialArrangements(language);
  I.enterFinancialAdvice(language);
  I.enterClaimCostsCorrespondent(language);

  if (['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFile(language);
  } else {
    const isDragAndDropSupported = await I.checkElementExist('.dz-hidden-input');
    I.uploadMarriageCertificateFile(language, isDragAndDropSupported);
  }

  await I.completeEquality(language);

  I.checkMyAnswers(language);
  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'Mae yna broblem\')]');
  if (genericErrorPage) {
    I.checkGenericErrorPage(language);
  } else {
    I.amDoneAndSubmitted(language);
  }

});

Scenario(`${language.toUpperCase()} - Desertion without agreement (cy)`, async function (I) {

  await stepsStartApplicationToReadFinancialRemedy(I, language);

  I.selectHelpWithFees(language, false);
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

  I.enterAddressUsingPostcode(language, '/petitioner-respondent/address');
  I.enterCorrespondence(language);
  I.selectLivingTogetherInSameProperty(language);

  I.chooseRespondentServiceAddress(language);
  I.enterAddressUsingPostcode(language, '/petitioner-respondent/respondent-correspondence-address');
  I.selectReasonForDivorce(language, divorceReason['desertionHeading']);
  I.enterDesertionAgreement(language);
  I.enterDesertionDate(language);
  I.selectLivingApartTime(language);
  I.enterDesertionDetails(language);

  I.enterLegalProceedings(language);
  I.selectFinancialArrangements(language);
  I.enterFinancialAdvice(language);
  I.enterClaimCosts(language);
  I.withoutUploadFile(language);

  await I.completeEquality(language);
  I.checkDesertionDateOnCYAPage(language);
  I.checkMyAnswers(language);

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if (genericErrorPage) {
    I.checkGenericErrorPage(language);
  } else {
    I.confirmIWillPayOnline(language);
  }

});

async function stepsStartApplicationToReadFinancialRemedy(I, language) {
  await I.amOnLoadedPage('/', language);
  I.startApplication(language);
  I.languagePreference(language);
  I.haveBrokenMarriage(language);
  I.haveRespondentAddress(language);
  I.haveMarriageCert(language);
  I.readFinancialRemedy(language);
}
