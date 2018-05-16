Feature('Invalid Paths Handling', { retries: 1 });

Scenario('Incorrect URLs are served a 404 page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario('Redirects to cookie error page if start application with no cookies', (I) => {

  const ignoreIdamToggle = true;

  I.amOnLoadedPage('/index');
  I.clearCookie();
  //  checkCookies middleware runs before idamAuth
  I.startApplication(ignoreIdamToggle);
  I.seeCurrentUrlEquals('/cookie-error');
});