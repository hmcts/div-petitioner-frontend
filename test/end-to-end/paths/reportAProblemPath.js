const config = require('config');

const phone = config.get('commonProps.courtPhoneNumber');
const hours = config.get('commonProps.courtOpeningHour');
const email = config.get('commonProps.courtEmail');

Feature('Report A Problem Handling').retry(3);

Scenario('I see link to go the ’Contact us for help’ page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.see('Contact us for help');
  I.click('//span[text()="Contact us for help"]');
  I.see('Phone');
  I.see(phone);
  I.see(hours);
  I.see('Email');
  I.see(`Email us at ${ email }`);
});
