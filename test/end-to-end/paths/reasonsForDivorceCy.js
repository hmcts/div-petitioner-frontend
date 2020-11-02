const languages = ['en', 'cy'];
const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

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

Feature('Reasons for divorce E2E Tests ...').retry(3);

languages.forEach( language => {

  Before((I) => {

    const commonContent = language === 'en' ? commonContentEn : commonContentCy;

    if (language === 'en') {
      I.amOnPage('https://petitioner-frontend-aks.demo.platform.hmcts.net?lng=en');
    } else {
      I.amOnPage('https://petitioner-frontend-aks.demo.platform.hmcts.net?lng=en');
    }

    I.navigateTheApplication(language, commonContent);
    I.wait(1);
    I.languagePreference(language, commonContent);
    I.haveBrokenMarriage(language, commonContent);
    I.haveRespondentAddress(language, commonContent);
    I.haveMarriageCert(language, commonContent);

    I.readFinancialRemedy(language, commonContent);
    I.selectHelpWithFees(language, commonContent);
    I.enterHelpWithFees(language, commonContent);
    I.selectDivorceType(language, commonContent);
    I.enterMarriageDate(language, commonContent);

    I.selectMarriedInUk(language, commonContent);

    I.chooseBothHabituallyResident(language, commonContent);
    I.chooseJurisdictionInterstitialContinue(language, commonContent);

    I.enterPeConfidentialContactDetails(language, commonContent);
    I.enterPetitionerAndRespondentNames(language, commonContent);
    I.enterMarriageCertificateDetails(language, commonContent);
    I.enterPetitionerChangedName(language, commonContent);
    I.enterPetitionerContactDetails(language, commonContent);

    I.enterAddressUsingPostcode('/petitioner-respondent/address');
    I.enterCorrespondence(language, commonContent);
    I.selectLivingTogetherInSameProperty(language, commonContent);

    I.chooseRespondentServiceAddress(language, commonContent);
    I.enterAddressUsingPostcode('/petitioner-respondent/respondent-correspondence-address');
  });


  Scenario(`${language.toUpperCase()} - Basic Divorce E2E - with added examples `, async function(I) {

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
      I.checkGenericErrorPage();
    }else {
      I.amDoneAndSubmitted();
    }

  }).tag('@functional3').retry(2);

  Scenario(`${language.toUpperCase()} - 2 years separation E2E `, async function(I) {

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

  }).retry(2);

  Scenario(` ${language.toUpperCase()} - 5 years separation E2E`, async function(I) {

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

});
