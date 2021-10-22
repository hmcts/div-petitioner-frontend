const content = require('app/steps/done-and-submitted/content.json').resources.en.translation.content;

const whoResponds = content.yourResponds.replace('{{ divorceWho }}', 'wife');

Feature('AosDrafted - Done and Submitted path @functional').retry(2);

Scenario('Done and Submitted page is displayed when AosDrafted case', async I => {
  I.startApplicationWith('asoDraftedSession');
  I.amOnLoadedPage('/done-and-submitted');

  I.see(content.title);
  I.see(whoResponds);
  I.see('What happens next');
});
