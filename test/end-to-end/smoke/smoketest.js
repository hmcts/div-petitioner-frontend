Feature('Smoke test', {retries: 2});

Scenario('Smoke Test ', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.wait(1);
  // I.languagePreference();
  I.signOut();
});

