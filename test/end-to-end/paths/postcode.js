const language = 'en';
Feature('Entering address @functional').retry(3);

Scenario('Enter address using postcode', I => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode(language, '/petitioner-respondent/address');
  I.seeInCurrentUrl('/petitioner-respondent/petitioner-correspondence/use-home-address');
});

Scenario('Enter address using address outside the UK', I => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressManually('/petitioner-respondent/address');
  I.seeInCurrentUrl('/petitioner-respondent/petitioner-correspondence/use-home-address');
});
