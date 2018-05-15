const { mockSession } = require('test/fixtures');

const petitionerAddress = mockSession.petitionerHomeAddress;
const respondentAddress = {
  address: ['82 Landor Road', 'London', 'SW9 9PE'],
  postcode: 'W6 0AT',
  addressConfirmed: 'true',
  addressType: 'postcode',
  postcodeError: 'false'
};

Feature('Living Together', { retries: 1 });

Scenario('Petitioner accepts their home address for paper contact', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
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


Scenario('Journey: Couple never lived together, and Respondents address not known so papers to be sent to their solicitor', (I) => {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.haveBrokenMarriage();
  I.amOnLoadedPage('/about-your-marriage/details');
  I.selectDivorceType();
  I.amOnLoadedPage('/petitioner-respondent/address');
  I.enterAddressUsingPostcode('/petitioner-respondent/address');
  I.enterCorrespondence();
  I.selectDoNotLiveTogetherInSameProperty();
  I.selectNoLastLivedTogetherAtAnotherAddress(petitionerAddress);
  I.enterAddressUsingPostcode('/petitioner-respondent/last-lived-together-address', '1');
  I.chooseDontKnowRespondentAddress(respondentAddress, 'husband');
  I.chooseSendPapersToSolicitorsAddress('husband');
  I.enterRespondentSolicitorDetails();
  I.enterAddressUsingPostcode('/petitioner-respondent/solicitor/address', '1');
});
