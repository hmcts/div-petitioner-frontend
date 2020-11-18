const languages = ['en', 'cy'];
const contentEn = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;
const moment = require('moment');
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

const fiveYearsAgo = moment().subtract(5, 'years').subtract(1, 'day');
const fiveYearsAgoFormatted = {
  day: fiveYearsAgo.format('D'),
  month: fiveYearsAgo.format('M'),
  year: fiveYearsAgo.format('Y')
};

Feature(' Reasons for divorce (5 years separation) E2E Tests @functional ').retry(2);

languages.forEach( language => {

  Scenario(`${language.toUpperCase()} - 5 years separation E2E @nightly `, async function(I) {

    const divorceReason = language === 'en' ? contentEn : contentCy;
    await I.completeLoginPageToEnterAddressUsingPostcode(language);
    I.selectReasonForDivorce(language, divorceReason['5YearsSeparationHeading']);
    I.enterSeparationDateNew(language, fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
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

  });

});
