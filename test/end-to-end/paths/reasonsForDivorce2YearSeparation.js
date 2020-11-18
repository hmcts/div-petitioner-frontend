const languages = ['en', 'cy'];
const contentEn = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;
const moment = require('moment');
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

const twoYearsAgo = moment().subtract(2, 'years').subtract(1, 'day');
const twoYearsAgoFormatted = {
  day: twoYearsAgo.format('D'),
  month: twoYearsAgo.format('M'),
  year: twoYearsAgo.format('Y')
};

Feature(' Reasons for divorce (2 ears separation) E2E Tests @functional ').retry(2);

languages.forEach( language => {

  Scenario(`${language.toUpperCase()} - 2 years separation E2E `, async function(I) {

    const divorceReason = language === 'en' ? contentEn : contentCy;
    await I.completeLoginPageToEnterAddressUsingPostcode(language);
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

  });

});
