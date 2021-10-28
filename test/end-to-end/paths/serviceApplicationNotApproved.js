const content = require('app/steps/service-application-not-approved/content.json').resources.en.translation.content;
const infoToContactRespondent = content.infoToContactRespondent.replace('{{ divorceWho }}', 'husband');

Feature('Service Application Rejected - Deemed @functional').retry(5);

Scenario('Service application not approved screen with expected information', async function (I) {

  I.startApplicationWith('serviceApplicationNotApprovedSession');
  I.amOnLoadedPage('/service-application-not-approved');

  I.see('Your \'deemed service\' application has been refused', '.govuk-heading-l');
  I.see(infoToContactRespondent);
  I.see(content.noResponseOptions);
  I.see(content.whichSituation);

  I.see('Deemed service refusal (PDF)', '.govuk-link');
  I.see('General Order (PDF)', '.govuk-link');
  I.dontSee('Dispense with service refusal (PDF)', '.govuk-link');
});
