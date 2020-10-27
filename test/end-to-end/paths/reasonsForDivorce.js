const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const moment = require('moment');
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

const twoYearsAgo = moment().subtract(2, 'years').subtract(1, 'day');
const twoYearsAgoFormatted = {
  day: twoYearsAgo.format('D'),
  month: twoYearsAgo.format('M'),
  year: twoYearsAgo.format('Y')
};

const fiveYearsAgo = moment().subtract(5, 'years').subtract(1, 'day');
const fiveYearsAgoFormatted = {
  day: fiveYearsAgo.format('D'),
  month: fiveYearsAgo.format('M'),
  year: fiveYearsAgo.format('Y')
};

Feature('Reasons for divorce E2E Tests @functional').retry(3);

Before((I) => {
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
});


Scenario('Basic Divorce E2E - with added examples', async function(I) {

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

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    // eslint-disable-next-line no-console
    console.log('Genereic Error');
    I.checkGenericErrorPage();
  }else {
    I.amDoneAndSubmitted();
  }

}).tag('@functional3').retry(2);

Scenario('2 years separation E2E', async function(I) {

  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['2YearsSeparationHeading']);
  I.selectRespondentConsentObtained();
  I.enterSeparationDateNew(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.selectLivingApartTime();

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
    await I.checkMyAnswers();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    I.checkGenericErrorPage();
  }else {
    I.amDoneAndSubmitted();
  }

}).tag('@functional3').retry(2);

Scenario('5 years separation E2E', async function(I) {

  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.selectLivingApartTime();
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
    await I.checkMyAnswers();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    I.checkGenericErrorPage();
  }else {
    I.amDoneAndSubmitted();
  }

}).retry(2);
