const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;
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

Feature('CY - Reasons for divorce E2E Tests @functional' ).retry(3);

Before(async (I) => {
  I.amOnPage('/index');
  await I.startApplicationCy();
  await I.languagePreferenceCy();
  await I.haveBrokenMarriageCy();
  await I.haveRespondentAddressCy();
  await I.haveMarriageCertCy();

  await I.readFinancialRemedyCy();
  await I.selectHelpWithFeesCy();
  await I.enterHelpWithFeesCy();
  await I.selectDivorceTypeCy();
  await I.enterMarriageDateCy();

  await I.selectMarriedInUkCy();

  I.chooseBothHabituallyResidentCy();
  await I.chooseJurisdictionInterstitialContinueCy();

  await I.enterPeConfidentialContactDetailsCy();
  await I.enterPetitionerAndRespondentNamesCy();
  await I.enterMarriageCertificateDetailsCy();
  await I.enterPetitionerChangedNameCy();
  await I.enterPetitionerContactDetailsCy();

  I.enterAddressUsingPostcodeCy('/petitioner-respondent/address');
  I.enterCorrespondenceCy();
  I.selectLivingTogetherInSamePropertyCy();

  I.chooseRespondentServiceAddressCy();
  I.enterAddressUsingPostcodeCy('/petitioner-respondent/respondent-correspondence-address');
});


Scenario('CY -Basic Divorce E2E ', async function(I) {

  await I.selectReasonForDivorceCy(content.unreasonableBehaviourHeading);
  await I.enterUnreasonableBehaviourExampleCy();

  await I.enterLegalProceedingsCy();
  await I.selectFinancialArrangementsCy();
  await I.enterFinancialAdviceCy();
  await I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    await I.withoutUploadFileCy();
  } else {
    await I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    await I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswersCy();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'Mae yna broblem\')]');
  if(genericErrorPage) {
    await I.checkGenericErrorPageCy();
  }else {
    await I.amDoneAndSubmittedCy();
  }

}).tag('@functional99').retry(2);

Scenario('CY -2 years separation E2E', async function(I) {

  await I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  await I.selectReasonForDivorceCy(content['2YearsSeparationHeading']);
  await I.selectRespondentConsentObtainedCy();
  await I.enterSeparationDateNewCy(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  await I.selectLivingApartTimeCy();

  await I.enterLegalProceedingsCy();
  await I.selectFinancialArrangementsCy();
  await I.enterFinancialAdviceCy();
  await I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    await I.withoutUploadFileCy();
  } else {
    await I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    await I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswersCy();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    await I.checkGenericErrorPageCy();
  }else {
    await I.amDoneAndSubmittedCy();
  }

}).retry(2);

xScenario('CY - 5 years separation E2E', async function(I) {

  await I.selectReasonForDivorceCy(content['5YearsSeprationHeading']);
  await I.enterSeparationDateNewCy(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  await I.selectLivingApartTimeCy();
  await I.enterLegalProceedingsCy();
  await I.selectFinancialArrangementsCy();
  await I.enterFinancialAdviceCy();
  await I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    await I.withoutUploadFileCy();
  } else {
    await I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    await I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswersCy();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    await I.checkGenericErrorPageCy();
  }else {
    await I.amDoneAndSubmittedCy();
  }

}).retry(2);
