Feature('Cookie Banner');

Scenario('The cookie banner displays when page is first hit', function*(I) {

  I.amOnPage('/index');
  yield I.seeCookieBanner();
  yield I.seeCookieFooter();
  let cookieBannerLink = yield I.grabAttributeFrom('#global-cookie-message a', 'href');
  I.followCookieBannerLink(cookieBannerLink);

  I.amOnPage('/index');
  I.dontGetShownCookieBannerAgain();
  I.seeCookieFooter();
});