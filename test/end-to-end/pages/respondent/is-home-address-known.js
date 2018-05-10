const selectContent = require('app/steps/respondent/home/is-known/content.json').resources.en.translation.content;


function chooseYesRespondentHomeAddressIsKnown() {
  completeRespondentHomeAddressIsKnownPage(this, selectContent.yes);
}

function chooseNoRespondentHomeAddressIsNotKnown() {
  completeRespondentHomeAddressIsKnownPage(this, selectContent.no);
}

function completeRespondentHomeAddressIsKnownPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/is-home-address-known');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  chooseYesRespondentHomeAddressIsKnown,
  chooseNoRespondentHomeAddressIsNotKnown
};