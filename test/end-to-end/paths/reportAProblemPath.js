const config = require('config');

const phone = config.get('commonProps.courtPhoneNumber');
const hours = config.get('commonProps.courtOpeningHour');
const email = config.get('commonProps.courtEmail');

Feature('Report A Problem Handling').retry(3);

Scenario('I see link to go the ’Report a problem’ page', (I) => {

  I.amOnLoadedPage('/index');
  I.waitForText('Is there a problem with this page');
  I.click('//span[text()="Is there a problem with this page?"]');
  I.waitForText('You can call or email us if you’re having problems with this service.');
  I.waitForText(`Phone: ${phone} (${hours})`);
  I.waitForText(`Email: ${email}`);
});
