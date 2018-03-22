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


Feature('Reasons for divorce');

Scenario('Unreasonable behaviour - with added examples', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate();
  I.amOnPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content.unreasonableBehaviourHeading);
  I.enterUnreasonableBehaviourAddMoreExamples();
  I.seeCurrentUrlEquals('/about-divorce/legal-proceedings');
  I.amOnPage('/check-your-answers');

});

Scenario('Adultery, with details', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.amOnPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['adulteryHeading']);
  I.selectWishToName();
  I.enter3rdPartyDetails();
  I.enterAddressUsingPostcode('/about-divorce/reason-for-divorce/adultery/co-respondent-address');
  I.selectAdulteryWhere();
  I.selectAdulteryWhen();
  I.enterAdulteryDetails();
});

Scenario('2 years separation', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.amOnPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['2YearsSeparationHeading']);
  I.enterSeparationDate(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.enterLegalProceedings();
});

Scenario('5 years separation', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.amOnPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDate(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.enterLegalProceedings();
});

Scenario('Exit if 5 years separation chosen but actual separation date is less', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year);
  I.amOnPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(content['5YearsSeparationHeading']);
  I.enterSeparationDate(twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.seeCurrentUrlEquals('/exit/separation');
  I.click('choose another reason');
  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/reason');
});


Scenario('Deserted without agreement', function*(I) {

  // Fill out all of the application
  // to test CYA content the application must be complete and valid
  I.amOnPage('/index');
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
  I.enterDesertionDate();
  I.enterDesertionAgreement();
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