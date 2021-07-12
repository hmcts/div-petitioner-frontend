const content = require('app/steps/screening-questions/has-respondent-address/content').resources.en.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

function startApplication(language = 'en', ignoreIdamToggle = false) {

  if (parseBool(CONF.features.idam) && !ignoreIdamToggle) {
    const commonContent = language === 'en' ? commonContentEn : commonContentCy;
    let I = this;

    const username = idamConfigHelper.getTestEmail();
    const password = idamConfigHelper.getTestPassword();
    I.waitForElement('#username');
    I.fillField('#username', username);
    I.fillField('#password', password);
    I.seeInCurrentUrl('/login?');
    I.navByClick(commonContent.signIn);
    I.wait(2);
  }
}

async function startApplicationWith(sessionName) {

  let I = this;

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveABasicSession(sessionName);
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
  I.see('Cookies', '#footer a[href="/cookies"]');
}

function followCookieBannerLink(cookiePageLink) {
  let I = this;
  const cookieTitle = 'body h1';

  I.amOnLoadedPage(cookiePageLink);
  I.see('Cookies', cookieTitle);
}

function dontGetShownCookieBannerAgain() {
  let I = this;

  I.dontSee(content.cookie);
  I.dontSee(content.cookieLink);
}

function signOut() {
  let I = this;

  I.waitForNavigation();
  I.see(commonContentEn.signOut);
  I.navByClick(commonContentEn.signOut);
}

module.exports = {
  startApplication,
  startApplicationWith,
  seeCookieBanner,
  seeCookieFooter,
  followCookieBannerLink,
  dontGetShownCookieBannerAgain,
  signOut
};
