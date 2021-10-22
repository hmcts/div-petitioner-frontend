const language = 'en';
const content = require('app/steps/grounds-for-divorce/reason/content.json').resources.en.translation.content;
const moment = require('moment');

const twoYearsAgo = moment().subtract(2, 'years')
  .subtract(1, 'day');

const twoYearsAgoFormatted = {
  day: twoYearsAgo.format('D'),
  month: twoYearsAgo.format('M'),
  year: twoYearsAgo.format('Y')
};
const fiveYearsAgo = moment().subtract(5, 'years')
  .subtract(1, 'day');
const fiveYearsAgoFormatted = {
  day: fiveYearsAgo.format('D'),
  month: fiveYearsAgo.format('M'),
  year: fiveYearsAgo.format('Y')
};
const tenYearsAgo = moment().subtract(10, 'years')
  .subtract(1, 'day');
const tenYearsAgoFormatted = {
  day: tenYearsAgo.format('D'),
  month: tenYearsAgo.format('M'),
  year: tenYearsAgo.format('Y')
};

Feature('Exit paths for divorce').retry(3);

Scenario('Exit if 5 years separation chosen but actual decision date is less', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(language, tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(language, content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(language, twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.seeInCurrentUrl('/exit/separation');
  I.navByClick('choose another reason');
  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/reason');
}).retry(1);


Scenario('Exit if 5 years separation chosen but actual living apart date is less', async I => {
  await I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  await I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.enterMarriageDate(language, tenYearsAgoFormatted.day, tenYearsAgoFormatted.month, tenYearsAgoFormatted.year);
  await I.amOnLoadedPage('/about-divorce/reason-for-divorce/reason');
  I.selectReasonForDivorce(language, content['5YearsSeparationHeading']);
  I.enterSeparationDateNew(language, fiveYearsAgoFormatted.day, fiveYearsAgoFormatted.month, fiveYearsAgoFormatted.year,
    twoYearsAgoFormatted.day, twoYearsAgoFormatted.month, twoYearsAgoFormatted.year);
  I.seeInCurrentUrl('/exit/separation');
  await I.navByClick('choose another reason');
  I.seeInCurrentUrl('/about-divorce/reason-for-divorce/reason');
}).retry(1);
