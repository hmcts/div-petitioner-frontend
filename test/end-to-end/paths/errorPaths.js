Feature('Invalid Paths Handling').retry(3);

Scenario('Incorrect URLs are served a 404 page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario('Redirects to cookie error page if start application with no cookies', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.clearCookie();
  //This simulates a situation where the browser has no cookies even after the middleware tried to set one for testing whether the browser accepts cookies
  I.amOnLoadedPage('/authenticated?attemptToSetTestCookie=true');
  I.seeCurrentUrlEquals('/cookie-error');
});
