const selectContent = require('app/steps/living-arrangements/live-together/content.json').resources.en.translation.content;


function selectLivingTogetherInSameProperty() {
  completeLivingTogetherPage(this, selectContent.yes);
}

function selectDoNotLiveTogetherInSameProperty() {
  completeLivingTogetherPage(this, selectContent.no);
}

function completeLivingTogetherPage(I, chosenOption) {
  I.seeCurrentUrlEquals('/petitioner-respondent/live-together');
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  selectLivingTogetherInSameProperty,
  selectDoNotLiveTogetherInSameProperty
};