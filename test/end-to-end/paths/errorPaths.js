Feature('Invalid Paths Handling').retry(5);

Scenario('Incorrect URLs are served a 404 page', (I) => {

  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario('Redirects to login page on AAT OR cookie error page for PR build on application start and clear cookies', async (I) => {
  await I.amOnLoadedPage('/index');
  I.startApplication();
  I.clearCookie();
  //This simulates a situation where the browser has no cookies even after the middleware tried to set one for testing whether the browser accepts cookies
  await I.amOnLoadedPage('/authenticated?attemptToSetTestCookie=true');

  let currentUrl = await I.grabCurrentUrl();
  // eslint-disable-next-line no-console
  console.log('Current Page Url-->:' + currentUrl);

  if (currentUrl.includes('-preview')) {
    I.seeCurrentUrlEquals('/cookie-error');
  }
  else {
    I.seeInCurrentUrl('/login?');
  }
});

Scenario('check cookie error page exists', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.amOnLoadedPage('/cookie-error');
  I.see('You must have cookies enabled in your web browser to use this service.');
});
