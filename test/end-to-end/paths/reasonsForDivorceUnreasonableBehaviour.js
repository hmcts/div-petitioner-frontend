const languages = ['en', 'cy'];
const contentEn = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const contentCy = require('app/steps/grounds-for-divorce/reason/content.json').resources.cy.translation.content;
const parseBool = require('app/core/utils/parseBool');
const config = require('config');

Feature(' Reasons for divorce (unreasonable behaviour) E2E Tests @functional ').retry(2);

languages.forEach( language => {

  Scenario(`${language.toUpperCase()} - Basic Divorce E2E `, async function(I) {

    const reasonContent = language === 'en' ? contentEn : contentCy;
    await I.completeLoginPageToEnterAddressUsingPostcode(language);
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

});
