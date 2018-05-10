const common = require('app/content/common.json').resources.en.translation;

Feature('Smoke test', { retries: 1 });

Scenario('Can see frontend index page', (I) => {
  I.amOnLoadedPage('/index');
  I.see(common.continue);
});