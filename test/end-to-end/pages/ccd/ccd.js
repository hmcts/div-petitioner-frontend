// const CONF = require('config');

async function checkMyCaseInCCD(caseId, caseType) {
  const I = this;
  const ccdUrl = 'https://www-ccd.nonprod.platform.hmcts.net/list/case';
  const ccdPrintUrl = 'https://gateway-ccd.nonprod.platform.hmcts.net';

  I.amOnLoadedPage(ccdUrl);
  I.seeInCurrentUrl('/login?');
  I.fillField('username', 'robreallywantsccdaccess@mailinator.com'); // CONF.ccd.divorceStaffEmail());
  I.fillField('password', 'Passw0rd'); // CONF.ccd.divorceStaffPassword());
  I.navByClick('Sign in');
  I.wait(2);
  I.waitForText('Case List');
  I.amOnLoadedPage(ccdPrintUrl);
  const accessTokenCookie = await I.grabCookie('accessToken');

  // Verify static session data still valid
  I.assertCorrectCaseIsInCcd(caseId, accessTokenCookie, caseType);
}

module.exports = { checkMyCaseInCCD };