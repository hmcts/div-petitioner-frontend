const CONF = require('config');
const today = new Date();
const cutoffDate = new Date(CONF.newAppCutoffDate);
const cutoff = JSON.parse(CONF.newAppCutoffDateOverride) ? true : today >= cutoffDate;

Feature('Smoke test', {retries: 2});

Scenario('Smoke Test ', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.wait(1);
  if (cutoff && JSON.parse(CONF.features.newAppCutoff)) {
    I.checkCutoffLandingPage();
  } else {
    I.languagePreference();
  }
  I.signOut();
});

