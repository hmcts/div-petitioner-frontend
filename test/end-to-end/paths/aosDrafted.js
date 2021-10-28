const content = require('app/steps/done-and-submitted/content.json').resources.en.translation.content;
const whoResponds = content.yourResponds.replace('{{ divorceWho }}', 'wife');

Feature('AosDrafted - Done and Submitted path @functional').retry(5);

Scenario('Done and Submitted page is displayed when AosDrafted case', async function (I) {
  I.startApplicationWith('asoDraftedSession');
  I.amOnLoadedPage('/done-and-submitted');

  I.see(content.title);
  I.see(whoResponds);
  I.see('What happens next');
});
