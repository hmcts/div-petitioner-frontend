const content = require('app/steps/issued-to-bailiff/content.json').resources.en.translation.content;
const whoResponds = content.yourResponds.replace('{{ divorceWho }}', 'wife');

Feature('IssuedToBailiff - Sent to Bailiff path @functional').retry(2);

Scenario('Done and Submitted page is displayed when AosDrafted case', async function (I) {
  I.startApplicationWith('IssuedToBailiff');
  I.amOnLoadedPage('/issued-to-bailiff');

  I.see(content.title);
  I.see(whoResponds);
  I.see('Your application for ‘personal service by a court bailiff’');

  // TODO: Ensure this works. This was made prior to development code being added.
});
