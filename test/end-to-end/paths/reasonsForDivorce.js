const languages = [ 'en', 'cy'];
const contentEn = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;
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

languages.forEach( language => {

  Feature(`${language.toUpperCase()} - Reasons for divorce E2E Tests @functional `);

  Before( async (I) => {

    await I.amOnLoadedPage('/', language );
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

    I.enterAddressUsingPostcode(language, '/petitioner-respondent/address');
    I.enterCorrespondence(language);
    I.selectLivingTogetherInSameProperty(language);

    I.chooseRespondentServiceAddress(language);
    I.enterAddressUsingPostcode(language,'/petitioner-respondent/respondent-correspondence-address');
  });

  After( async (I) => {
    I.signOut(language);
  });

  Scenario(`${language.toUpperCase()} - Basic Divorce E2E `, async function(I) {

    const reasonContent = language === 'en' ? contentEn : contentCy;
    I.selectReasonForDivorce(language, reasonContent['unreasonableBehaviourHeading']);
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

    if (language === 'en') {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }else {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'Mae yna broblem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }

  });

  Scenario(`${language.toUpperCase()} - 2 years separation E2E `, async function(I) {

    const divorceReason = language === 'en' ? contentEn : contentCy;
    I.selectReasonForDivorce(language, divorceReason['2YearsSeparationHeading']);
    I.selectRespondentConsentObtained(language);
    I.enterSeparationDateNew(language, twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
      twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);

    I.selectLivingApartTime(language);
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
      await I.checkMyAnswers(language);
    }

    if (language === 'en') {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }else {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'Mae yna broblem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }

  }).retry(2);

  xScenario(`${language.toUpperCase()} - 5 years separation E2E `, async function(I) {

    I.selectReasonForDivorce(language, content['5YearsSeparationHeading']);
    I.enterSeparationDateNew(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
      fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
    I.selectLivingApartTime(language);
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
      await I.checkMyAnswers(language);
    }

    if (language === 'en') {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'There has been a problem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }else {
      const genericErrorPage = await I.checkElementExist('//h1[contains(text(), \'Mae yna broblem\')]');
      if(genericErrorPage) {
        I.checkGenericErrorPage(language);
      }else {
        I.amDoneAndSubmitted(language);
      }
    }

  }).retry(2);

});
