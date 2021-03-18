Feature('Invalid Paths Handling @functional');

Scenario('Incorrect URLs are served a 404 page', async(I) => {

  I.amOnLoadedPage('/index');
  await I.startApplication();//TODO - replace all when we're certain of this change
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/nonExistentURL');
  I.see('Page not found', 'h1');

});

Scenario.skip('Redirects to login page on AAT OR cookie error page for PR build on application start and clear cookies', async (I) => {
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
}).retry(2);

Scenario('check cookie error page exists', async (I) => {
  I.amOnLoadedPage('/index');
  await I.startApplication();
  I.amOnLoadedPage('/cookie-error');
  I.see('You must have cookies enabled in your web browser to use this service.');
});