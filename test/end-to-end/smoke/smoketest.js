Feature('Smoke test', {retries: 2});

Scenario('As a user, I want to be able to see frontend index page and log in as a caseworker ', (I) => {
  I.amOnLoadedPage('/index');
  I.see('Sign in or create an account');
  I.loginInAsCaseworker();
  I.see('What language do you want us to use when we contact you?');
  I.click('Continue');
  I.seeCurrentUrlEquals('/screening-questions/has-marriage-broken');
  I.signOut();
  I.see('Sign in or create an account');

});
