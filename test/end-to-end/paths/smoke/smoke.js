const content = require('app/steps/index/content.json').resources.en.translation.content;

Feature('Basic smoke test', { retries: 1 });

Scenario('Index page has successfully loaded', (I) => {

  I.amOnPage('/index');
  I.see(content.title);

});