const content = require('app/steps/issued-to-bailiff/content.json').resources.en.translation.content;
const whoResponds = content.yourResponds.replace('{{ divorceWho }}', 'wife');

Feature('IssuedToBailiff - Sent to Bailiff path').retry(5);

Scenario('Issued-to-bailiff page is displayed when IssuedToBailiff case', async function (I) {
  await I.startApplicationWith('issueToBailiffSession');
  await I.amOnLoadedPage('/issued-to-bailiff');

  I.see(content.mainHeading);
  I.see(whoResponds);
  I.see('Your application for ‘personal service by a court bailiff’');
});
