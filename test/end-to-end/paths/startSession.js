Feature('Initiating Session');

Scenario('Redirected to /index page when request a session-required page with no session cookies', (I) => {

  I.clearCookie();
  I.amOnPage('/check-your-answers');
  I.seeCurrentUrlEquals('/index');
});