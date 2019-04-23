const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const moment = require('moment');

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

const tenYearsAgo = moment().subtract(10, 'years').subtract(1, 'day');
const tenYearsAgoFormatted = {
  day: tenYearsAgo.format('D'),
  month: tenYearsAgo.format('M'),
  year: tenYearsAgo.format('Y')
};

Feature('Reasons for divorce').retry(3);

Scenario('Unreasonable behaviour - with added examples', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate();
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
  I.enterUnreasonableBehaviourAddMoreExamples();
  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
  I.amOnLoadedPage('/check-your-answers');

});

Scenario('Adultery, with details', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['adulteryHeading']);
  I.selectWishToName();
  I.enter3rdPartyDetails();
  I.enterAddressUsingPostcode('/about-divorce/reason-for-divorce/adultery/co-respondent-address');
  I.selectAdulteryWhere();
  I.selectAdulteryWhen();
  I.enterAdulteryDetails();
  I.enterAdulterySecondHandInfo();
  I.enterLegalProceedings();
});

Scenario('2 years separation', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['2YearsSeparationHeading']);
  I.selectRespondentConsentObtained();
  I.enterSeparationDateNew(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.selectLivingApartTime();

  I.enterLegalProceedings();
});

Scenario('5 years separation', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.selectLivingApartTime();
  I.enterLegalProceedings();
});

Scenario('Exit if 5 years separation chosen but actual decision date is less', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.seeCurrentUrlEquals('/exit/separation');
  I.navByClick('choose another reason');
  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/reason');
});

Scenario('Exit if 5 years separation chosen but actual living apart date is less', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.seeCurrentUrlEquals('/exit/separation');
  I.navByClick('choose another reason');
  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/reason');
});


Scenario('Deserted without agreement', function*(I) {

  // Fill out all of the application
  // to test CYA content the application must be complete and valid
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.haveRespondentAddress();
  I.haveMarriageCert();

  I.selectHelpWithFees(false);

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

  I.selectReasonForDivorce(content['desertionHeading']);
  I.enterDesertionAgreement();
  I.enterDesertionDate();
  I.selectLivingApartTime();
  I.enterDesertionDetails();

  I.enterLegalProceedings();
  I.selectFinancialArrangements();
  I.enterFinancialAdvice();
  I.enterClaimCosts();

  const isDragAndDropSupported = yield I.checkElementExist('.dz-hidden-input');
  I.uploadMarriageCertificateFile(isDragAndDropSupported);
  I.checkDesertionDateOnCYAPage();
  I.checkMyAnswers();
  I.confirmIWillPayOnline();
});
