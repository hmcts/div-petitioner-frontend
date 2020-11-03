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

Feature('Welsh- Reasons for divorce E2E Tests ' ).retry(3);

Before(async (I) => {
  I.amOnPage('/index');
  await I.startApplicationCy();
  await I.wait(3);
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


Scenario('Welsh -Basic Divorce E2E - with added examples', async function(I) {

  await I.selectReasonForDivorceCy(content.unreasonableBehaviourHeading);
  I.enterUnreasonableBehaviourExampleCy();

  I.enterLegalProceedingsCy();
  I.selectFinancialArrangementsCy();
  I.enterFinancialAdviceCy();
  I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFileCy();
  } else {
    I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswersCy();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    I.checkGenericErrorPageCy();
  }else {
    I.amDoneAndSubmittedCy();
  }

}).tag('@functional').retry(2);

Scenario('Welsh - 2 years separation E2E', async function(I) {

  await I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  await I.selectReasonForDivorceCy(content['2YearsSeparationHeading']);
  I.selectRespondentConsentObtainedCy();
  I.enterSeparationDateNewCy(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.selectLivingApartTimeCy();

  I.enterLegalProceedingsCy();
  I.selectFinancialArrangementsCy();
  I.enterFinancialAdviceCy();
  I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFileCy();
  } else {
    I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswers();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    I.checkGenericErrorPageCy();
  }else {
    I.amDoneAndSubmittedCy();
  }

}).retry(2);

Scenario('Welsh - 5 years separation E2E', async function(I) {

  await I.selectReasonForDivorceCy(content['5YearsSeprationHeading']);
  I.enterSeparationDateNewCy(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.selectLivingApartTimeCy();
  I.enterLegalProceedingsCy();
  I.selectFinancialArrangementsCy();
  I.enterFinancialAdviceCy();
  I.enterClaimCostsCy();

  if(['safari', 'microsoftEdge'].includes(config.features.browserSupport)) {
    I.withoutUploadFileCy();
  } else {
    I.withoutUploadFileCy();
  }

  await I.completeEqualityCy();

  if (parseBool(config.features.ignoreSessionValidation)) {
    I.checkMyAnswersCy();
  } else{
    await I.checkMyAnswersCy();
  }

  const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
  if(genericErrorPage) {
    I.checkGenericErrorPageCy();
  }else {
    I.amDoneAndSubmittedCy();
  }

}).tag('@functional').retry(2);
