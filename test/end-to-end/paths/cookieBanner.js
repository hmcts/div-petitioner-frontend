Feature('Cookie Banner', { retries: 1 });

Scenario('The cookie banner displays when page is first hit', function*(I) {

  I.amOnLoadedPage('/index');
  yield I.seeCookieBanner();
  yield I.seeCookieFooter();
  let cookieBannerLink = yield I.grabAttributeFrom('#global-cookie-message a', 'href');
  I.followCookieBannerLink(cookieBannerLink);

  I.amOnLoadedPage('/index');
  I.dontGetShownCookieBannerAgain();
  I.seeCookieFooter();
});