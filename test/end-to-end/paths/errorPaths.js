Feature('Invalid Paths Handling');

Scenario('Incorrect URLs are served a 404 page', (I) => {

  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario('Redirects to cookie error page if start application with no cookies', (I) => {

  const ignoreIdamToggle = true;

  I.amOnPage('/index');
  I.clearCookie();
  //  checkCookies middleware runs before idamAuth
  I.startApplication(ignoreIdamToggle);
  I.seeCurrentUrlEquals('/cookie-error');
});