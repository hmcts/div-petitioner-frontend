const content = require('app/steps/index/content.json').resources.en.translation.content;

Feature('Smoke test', { retries: 1 });

Scenario('Can see frontend index page', (I) => {
  I.amOnPage('/index');
  I.see(content.startNow);
});