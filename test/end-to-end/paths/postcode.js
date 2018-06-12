Feature('Entering address', { retries: 1 });

Scenario('Enter address using postcode', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.seeCurrentUrlEquals('/petitioner-respondent/petitioner-correspondence/use-home-address');
});

Scenario('Enter address using address outside the UK', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressManually('/petitioner-respondent/address');
  I.seeCurrentUrlEquals('/petitioner-respondent/petitioner-correspondence/use-home-address');
});