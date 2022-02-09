const CONF = require('config');

Feature('Cookie Banner @cross-browser-test').retry(5);

Scenario('The cookie banner displays when page is first hit', function*(I) {

  I.amOnLoadedPage('/index');
  I.startApplication();

  // Only execute the bulk of the tests if the dynatrace feature toggle is enabled
  if (CONF.features.dynatrace) {
    yield I.seeCookieBanner();
    yield I.seeCookieFooter();
    let cookieBannerLink = yield I.grabAttributeFrom('#global-cookie-message a', 'href');
    I.followCookieBannerLink(cookieBannerLink);

    I.amOnLoadedPage('/index');
    I.dontGetShownCookieBannerAgain();
    I.seeCookieFooter();
  } else {
    I.seeCookieFooter();
  }

});
