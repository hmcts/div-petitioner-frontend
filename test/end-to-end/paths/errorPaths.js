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

Scenario('Redirects to application submitted page if case already submitted with feature flag', (I) => {

  I.startApplicationWithAnExistingSession();
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();
  I.amOnPage('/check-your-answers');
  I.waitInUrl('/application-submitted');
});