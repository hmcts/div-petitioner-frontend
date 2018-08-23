const CONF = require('config');

Feature('Invalid Paths Handling').retry(3);

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

// This test will not run except for test scenarios as we will disable the flag except on prod
Scenario('Redirects to application submitted page if case already submitted with feature flag', (I) => {

  if (CONF.features.redirectToApplicationSubmitted) {
    I.startApplicationWithAnExistingSession();
    I.amOnLoadedPage('/check-your-answers');
    I.checkMyAnswers();
    I.amOnPage('/check-your-answers');
    I.waitInUrl('/application-submitted');
  }
});