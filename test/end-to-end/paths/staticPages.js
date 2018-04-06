const privacyPolicyContent = require('app/steps/privacy-policy/content.json').resources.en.translation.content;
const termsAndConditionsContent = require('app/steps/terms-and-conditions/content.json').resources.en.translation.content;

Feature('Static Pages');

Scenario('View the cookies page', (I) => {

  I.amOnPage('/cookie');
});

Scenario('View the terms and conditions page', (I) => {

  I.amOnPage('/terms-and-conditions');
  I.see(termsAndConditionsContent.whoWeAre);
  I.see(termsAndConditionsContent.managedBy);
  I.see(termsAndConditionsContent.update);
});

Scenario('View the privacy policy page', (I) => {

  I.amOnPage('/privacy-policy');
  I.see(privacyPolicyContent.whoManages);
  I.see(privacyPolicyContent.managedBy);
  I.see(privacyPolicyContent.info);
});