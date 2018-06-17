const privacyPolicyContent = require('app/steps/privacy-policy/content.json').resources.en.translation.content;
const termsAndConditionsContent = require('app/steps/terms-and-conditions/content.json').resources.en.translation.content;

Feature('Static Pages').retry(3);

Scenario('View the cookies page', (I) => {

  I.amOnLoadedPage('/cookie');
});

Scenario('View the terms and conditions page', (I) => {

  I.amOnLoadedPage('/terms-and-conditions');
  I.waitForText(termsAndConditionsContent.whoWeAre);
  I.waitForText(termsAndConditionsContent.managedBy);
  I.waitForText(termsAndConditionsContent.update);
});

Scenario('View the privacy policy page', (I) => {

  I.amOnLoadedPage('/privacy-policy');
  I.waitForText(privacyPolicyContent.whoManages);
  I.waitForText(privacyPolicyContent.managedBy);
  I.waitForText(privacyPolicyContent.info);
});