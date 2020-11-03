const content = require('app/steps/screening-questions/has-respondent-address/content').resources.en.translation.content;
const common = require('app/content/common-en').resources.en.translation;
const CONF = require('config');
const idamConfigHelper = require('test/end-to-end/helpers/idamConfigHelper.js');
const parseBool = require('app/core/utils/parseBool');

function startApplication(ignoreIdamToggle = false) {

  if (parseBool(CONF.features.idam) && !ignoreIdamToggle) {
    let I = this;
    I.seeInCurrentUrl('/login?');
    I.fillField('username', idamConfigHelper.getTestEmail());
    I.fillField('password', idamConfigHelper.getTestPassword());
    I.navByClick('Sign in');
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
  I.see('Cookies', '#footer a[href="/cookie"]');
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

  I.see(common.signOut);
  I.navByClick(common.signOut);
}

async function startApplicationCy(ignoreIdamToggle = false) {

  if (parseBool(CONF.features.idam) && !ignoreIdamToggle) {

    let I = this;
    await I.amOnLoadedPage('?lng=cy');
    I.seeInCurrentUrl('/login?');
    I.fillField('username', idamConfigHelper.getTestEmail());
    I.fillField('password', idamConfigHelper.getTestPassword());
    await I.navByClick('Mewngofnodi');
    I.wait(2);
  }
}

async function getCurrentPageUrl() {
  const I = this;
  const url = await I.grabCurrentUrl();
  // eslint-disable-next-line no-console
  console.log('Current Page Url==>::' + url);
  let spiltPath = url.split('.net');
  let pagePath = spiltPath[1];
  // eslint-disable-next-line no-console
  console.log('Page Path ==> ::' + pagePath);
  return pagePath;
}

module.exports = {
  startApplication,
  startApplicationWith,
  seeCookieBanner,
  seeCookieFooter,
  followCookieBannerLink,
  dontGetShownCookieBannerAgain,
  signOut,
  startApplicationCy,
  getCurrentPageUrl
};
