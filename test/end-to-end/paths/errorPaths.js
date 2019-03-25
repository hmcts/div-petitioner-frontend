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
  I.amOnLoadedPage('/authenticated');
  I.seeCurrentUrlEquals('/cookie-error');
});
