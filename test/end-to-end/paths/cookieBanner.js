Feature('Cookie Banner @cross-browser-test').retry(3);

Scenario('The cookie banner displays when page is first hit', function* (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  yield I.seeCookieBanner();
  yield I.seeCookieFooter();
  const cookieBannerLink = yield I.grabAttributeFrom('#global-cookie-message a', 'href');
  I.followCookieBannerLink(cookieBannerLink);

  I.amOnLoadedPage('/index');
  I.dontGetShownCookieBannerAgain();
  I.seeCookieFooter();
});
