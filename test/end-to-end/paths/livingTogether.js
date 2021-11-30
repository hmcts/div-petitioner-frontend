const { mockSession } = require('test/fixtures');
const language = 'en';

const petitionerAddress = mockSession.petitionerHomeAddress;
const respondentAddress = {
  address: ['82, LANDOR ROAD', 'LONDON', 'SW9 9PE'],
  postcode: 'SW9 9PE',
  addressConfirmed: 'true',
  addressType: 'postcode',
  postcodeError: 'false'
};

Feature('Living Together @functional').retry(5);

Scenario('Petitioner accepts their home address for paper contact', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode(language,'/petitioner-respondent/address');
  I.enterCorrespondence(language);
});

Scenario('Petitioner and Respondent last lived together at a different address', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode(language,'/petitioner-respondent/address');
  I.enterCorrespondence(language);
  I.selectDoNotLiveTogetherInSameProperty(language);
  I.selectNoLastLivedTogetherAtAnotherAddress(petitionerAddress);
  I.enterAddressUsingPostcode(language,'/petitioner-respondent/last-lived-together-address', '1');
  I.chooseYesRespondentLivesAtAddress(respondentAddress);
});

Scenario('Petitioner and Respondent never lived together', (I) => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.languagePreference();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode(language,'/petitioner-respondent/address');
  I.enterCorrespondence(language);
  I.selectDoNotLiveTogetherInSameProperty(language);
  I.selectNoNeverLivedTogether(petitionerAddress);
  I.chooseNoRespondentHomeAddressIsNotKnown();
});
