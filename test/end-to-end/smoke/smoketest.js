Feature('Smoke test', { retries: 2 });

Scenario('Can see frontend index page', (I) => {
  I.amOnLoadedPage('/index');
  I.see('Sign in');
});
