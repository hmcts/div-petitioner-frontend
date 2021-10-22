Feature('Initiating Session').retry(3);

Scenario('Redirected to /index page when request a session-required page with no session cookies', I => {
  I.clearCookie();
  I.amOnLoadedPage('/check-your-answers');
  I.see('Sign in');
});
