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

    I.fillField('username', idamConfigHelper.getTestEmail());
    I.fillField('password', idamConfigHelper.getTestPassword());

    if (language === 'en') {
      I.seeInCurrentUrl('/login?');
      I.navByClick(commonContent.signIn);
    } else {
      // eslint-disable-next-line no-console
      console.log('Welsh Click ==>:' + language);
      I.wait(2);
      I.navByClick('Parhau');
    }

    I.wait(2);
  }
}

async function startApplicationWith(sessionName) {

  let I = this;

  I.amOnLoadedPage('/index');
  I.startApplication('en');
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

function signOut(language = 'en') {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  let I = this;

  I.see(commonContent.signOut);
  I.navByClick(commonContent.signOut);
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
