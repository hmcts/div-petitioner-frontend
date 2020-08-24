const saContent = require('app/steps/service-application-not-approved/content.json').resources.en.translation.content;
const mainHeading = saContent.mainHeading.replace('{{ serviceApplicationTypeLabel }}', '\'deemed service\'');
const infoToContactRespondent = saContent.infoToContactRespondent.replace('{{ divorceWho }}', 'husband');

Feature('Service Application Rejected');

Scenario('Service application not approved screen with expected information', async function (I) {

  I.startApplicationWith('serviceApplicationNotApprovedSession');
  I.amOnLoadedPage('/service-application-not-approved');

  I.see(mainHeading);
  I.see(infoToContactRespondent);
  I.see(saContent.noResponseOptions);
  I.see(saContent.whichSituation);

});
