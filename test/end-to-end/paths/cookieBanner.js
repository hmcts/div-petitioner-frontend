Feature('Cookie Banner @functional').retry(3);

Scenario('The cookie banner displays when page is first hit', function*(I) {

  I.amOnLoadedPage('/');
  I.startApplication();
  yield I.seeCookieBanner();
  yield I.seeCookieFooter();
  let cookieBannerLink = yield I.grabAttributeFrom('#global-cookie-message a', 'href');
  I.followCookieBannerLink(cookieBannerLink);

  I.amOnLoadedPage('/');
  I.dontGetShownCookieBannerAgain();
  I.seeCookieFooter();
});
