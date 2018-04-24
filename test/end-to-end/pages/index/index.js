const content = require('app/steps/index/content.json').resources.en.translation.content;
let toggleStore = require('test/end-to-end/helpers/featureToggleStore.js');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

function startApplication(ignoreIdamToggle = false) {

  let I = this;

  I.seeCurrentUrlEquals('/index');
  I.see(content.startNow);
  I.click(content.startNow);

  if (toggleStore.getToggle('idam') && !ignoreIdamToggle) {
    I.seeInCurrentUrl('/login?');
    I.fillField('username', idamConfigHelper.getTestEmail());
    I.fillField('password', idamConfigHelper.getTestPassword());
    I.click('Sign in');
  }
}

function* seeCookieBanner() {
  let I = this;

  yield I.waitForVisible('#global-cookie-message');
  I.see(content.cookie);
  I.see(content.cookieLink);
}

function* seeCookieFooter() {
  let I = this;

  yield I.waitForVisible('#footer');
  I.see('Cookies', '#footer a[href="/cookie"]');
}

function followCookieBannerLink(cookiePageLink) {
  let I = this;
  const cookieTitle = '#content h1';

  I.amOnPage(cookiePageLink);
  I.see('Cookies', cookieTitle);
}

function dontGetShownCookieBannerAgain() {
  let I = this;

  I.dontSee(content.cookie);
  I.dontSee(content.cookieLink);
}

module.exports = { startApplication, seeCookieBanner, seeCookieFooter, followCookieBannerLink, dontGetShownCookieBannerAgain };