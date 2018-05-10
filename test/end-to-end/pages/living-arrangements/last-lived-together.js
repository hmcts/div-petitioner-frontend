const selectContent = require('app/steps/living-arrangements/last-lived-together/at-petitioner-home-address/content.json').resources.en.translation.content;
const prettifyAddress = require('test/end-to-end/helpers/GeneralHelpers.js').prettifyAddress;


function selectYesLastLivedTogetherAtAddress(address) {
  completeLastLivedTogetherPage(this, address, selectContent.yes);
}

function selectNoLastLivedTogetherAtAnotherAddress(address) {
  completeLastLivedTogetherPage(this, address, selectContent.no);
}

function selectNoNeverLivedTogether(address) {
  completeLastLivedTogetherPage(this, address, '#livingArrangementsLastLivedTogether_Never');
}

function completeLastLivedTogetherPage(I, address, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/last-lived-together');
  if (address) {
    I.see(prettifyAddress(address));
  }
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  selectYesLastLivedTogetherAtAddress,
  selectNoLastLivedTogetherAtAnotherAddress,
  selectNoNeverLivedTogether
};