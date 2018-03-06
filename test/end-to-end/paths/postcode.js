Feature('Entering address');

Scenario('Enter address using postcode', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.seeCurrentUrlEquals('/petitioner-respondent/petitioner-correspondence/use-home-address');
});

Scenario('Enter address using address outside the UK', (I) => {
  I.amOnPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnPage('/petitioner-respondent/address');
  I.enterAddressManually('/petitioner-respondent/address');
  I.seeCurrentUrlEquals('/petitioner-respondent/petitioner-correspondence/use-home-address');
});