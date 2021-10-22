const content = require('app/steps/screening-questions/has-respondent-address/content').resources.en.translation.content;
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;
const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

function startApplication(language = 'en', ignoreIdamToggle = false) {
  if (parseBool(CONF.features.idam) && !ignoreIdamToggle) {
    const commonContent = language === 'en' ? commonContentEn : commonContentCy;
    const I = this;

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
  const I = this;

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveABasicSession(sessionName);
}

function* seeCookieBanner() {
  const I = this;

  yield I.waitForVisible('#global-cookie-message');
  I.see(content.cookie);
  I.see(content.cookieLink);
}

function* seeCookieFooter() {
  const I = this;

  yield I.waitForVisible('#footer');
  I.see('Cookies', '#footer a[href="/cookie"]');
}

function followCookieBannerLink(cookiePageLink) {
  const I = this;
  const cookieTitle = 'body h1';

  I.amOnLoadedPage(cookiePageLink);
  I.see('Cookies', cookieTitle);
}

function dontGetShownCookieBannerAgain() {
  const I = this;

  I.dontSee(content.cookie);
  I.dontSee(content.cookieLink);
}

function signOut() {
  const I = this;

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
