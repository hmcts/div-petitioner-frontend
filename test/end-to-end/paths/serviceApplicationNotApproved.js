const content = require('app/steps/service-application-not-approved/content.json').resources.en.translation.content;
const mainHeading = content.mainHeading.replace('{{ serviceApplicationTypeLabel }}', '\'deemed service\'');
const infoToContactRespondent = content.infoToContactRespondent.replace('{{ divorceWho }}', 'husband');

Feature('Service Application Rejected - Deemed');

Scenario('Service application not approved screen with expected information', async function (I) {

  I.startApplicationWith('serviceApplicationNotApprovedSession');
  I.amOnLoadedPage('/service-application-not-approved');

  I.see(mainHeading);
  I.see(infoToContactRespondent);
  I.see(content.noResponseOptions);
  I.see(content.whichSituation);

  I.see('Deemed service refusal (PDF)', '.govuk-link');
  I.dontSee('Dispense with service refusal (PDF)', '.govuk-link');

});
