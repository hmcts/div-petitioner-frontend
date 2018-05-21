const config = require('config');

const phone = config.get('commonProps.courtPhoneNumber');
const hours = config.get('commonProps.courtOpeningHour');
const email = config.get('commonProps.courtEmail');

Feature('Report A Problem Handling', { retries: 1 });

Scenario('I see link to go the ’Report a problem’ page', (I) => {

  I.amOnLoadedPage('/index');
  I.see('Is there a problem with this page');
  I.click('//span[text()="Is there a problem with this page?"]');
  I.see('You can call or email us if you’re having problems with this service.');
  I.see(`Phone: ${phone} (${hours})`);
  I.see(`Email: ${email}`);
});
