const config = require('config');
const commonContent = require('app/content/common-en').resources.en.translation;

const phone = config.get('commonProps.courtPhoneNumberEn');
const hours1 = config.get('commonProps.courtOpeningHourEnLine1');
const hours2 = config.get('commonProps.courtOpeningHourEnLine2');

Feature('Report A Problem Handling @cross-browser-test').retry(5);

Scenario('I see link to go the ’Contact us for help’ page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.see(commonContent.problemWithThisPage);
  I.click(`//span[text()="${commonContent.problemWithThisPage}"]`);

  I.see(commonContent.webChatTitle);

  // telephone
  I.see(commonContent.phoneTitle);
  I.see(phone);
  I.see(hours1);
  I.see(hours2);

  // email
  I.see(commonContent.emailTitle);
  I.see(commonContent.responseTime);
});
