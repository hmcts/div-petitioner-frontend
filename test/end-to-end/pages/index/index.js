const content = require('app/steps/index/content.json').resources.en.translation.content;
const common = require('app/content/common.json').resources.en.translation;
let toggleStore = require('test/end-to-end/helpers/featureToggleStore.js');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');

function startApplication(ignoreIdamToggle = false) {

  let I = this;

  I.seeCurrentUrlEquals('/index');
  I.see(common.continue);
  I.navByClick(common.continue);

  if (toggleStore.getToggle('idam') && !ignoreIdamToggle) {
    I.seeInCurrentUrl('/login?');
    I.fillField('username', idamConfigHelper.getTestEmail());
    I.fillField('password', idamConfigHelper.getTestPassword());
    I.navByClick('Sign in');
    I.wait(2);
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

  I.amOnLoadedPage(cookiePageLink);
  I.see('Cookies', cookieTitle);
}

function dontGetShownCookieBannerAgain() {
  let I = this;

  I.dontSee(content.cookie);
  I.dontSee(content.cookieLink);
}

module.exports = { startApplication, seeCookieBanner, seeCookieFooter, followCookieBannerLink, dontGetShownCookieBannerAgain };