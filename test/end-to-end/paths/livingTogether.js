const { mockSession } = require('test/fixtures');

const petitionerAddress = mockSession.petitionerHomeAddress;
const respondentAddress = {
  address: ['82, LANDOR ROAD', 'LONDON', 'SW9 9PE'],
  postcode: 'SW9 9PE',
  addressConfirmed: 'true',
  addressType: 'postcode',
  postcodeError: 'false'
};

Feature('Living Together').retry(3);

Scenario('Petitioner accepts their home address for paper contact', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.enterCorrespondence(petitionerAddress);
});

Scenario('Petitioner and Respondent last lived together at a different address', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.enterCorrespondence();
  I.selectDoNotLiveTogetherInSameProperty();
  I.selectNoLastLivedTogetherAtAnotherAddress(petitionerAddress);
  I.enterAddressUsingPostcode('/petitioner-respondent/last-lived-together-address', '1');
  I.chooseYesRespondentLivesAtAddress(respondentAddress);
});

Scenario('Petitioner and Respondent never lived together', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.enterCorrespondence();
  I.selectDoNotLiveTogetherInSameProperty();
  I.selectNoNeverLivedTogether(petitionerAddress);
  I.chooseNoRespondentHomeAddressIsNotKnown();
});
