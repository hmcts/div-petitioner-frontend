const selectContent = require('app/steps/respondent/home/lives-at-last-address/content.json').resources.en.translation.content;
const prettifyAddress = require('test/end-to-end/helpers/GeneralHelpers.js').prettifyAddress;


function chooseYesRespondentLivesAtAddress(address) {
  completeLivesAtLastAddressPage(this, address, selectContent.yes);
}

function chooseNoRespondentLivesAtAnotherAddress(address, respondent) {
  const selection = (respondent === 'husband') ? selectContent['no-husband'] : selectContent['no-wife'];
  completeLivesAtLastAddressPage(this, address, selection);
}

function chooseDontKnowRespondentAddress(address, respondent) {
  const selection = (respondent === 'husband') ? selectContent['unknown-husband'] : selectContent['unknown-wife'];
  completeLivesAtLastAddressPage(this, address, selection);
}

function completeLivesAtLastAddressPage(I, address, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/lives-at-this-address');
  if (address) {
    I.see(prettifyAddress(address));
  }
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  chooseYesRespondentLivesAtAddress,
  chooseNoRespondentLivesAtAnotherAddress,
  chooseDontKnowRespondentAddress
};