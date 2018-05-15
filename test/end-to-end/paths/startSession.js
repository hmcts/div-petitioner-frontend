Feature('Initiating Session', { retries: 1 });

Scenario('Redirected to /index page when request a session-required page with no session cookies', (I) => {

  I.clearCookie();
  I.amOnLoadedPage('/check-your-answers');
  I.seeCurrentUrlEquals('/index');
});