const config = require('config');
const commonContent = require('app/content/common').resources.en.translation;

const phone = config.get('commonProps.courtPhoneNumber');
const hours = config.get('commonProps.courtOpeningHour');

Feature('Report A Problem Handling').retry(3);

Scenario.only('I see link to go the ’Contact us for help’ page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.see(commonContent.problemWithThisPage);
  I.click(`//span[text()="${commonContent.problemWithThisPage}"]`);

  // webchat
  if (config.features.webchat) {
    I.see(commonContent.webChatTitle);
  }

  // telephone
  I.see(commonContent.phoneTitle);
  I.see(phone);
  I.see(hours);

  // email
  I.see(commonContent.emailTitle);
  I.see(commonContent.responseTime);
});
