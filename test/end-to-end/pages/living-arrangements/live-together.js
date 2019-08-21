const selectContent = require('app/steps/living-arrangements/live-together/content.json').resources.en.translation.content;
const pagePath = '/petitioner-respondent/live-together';

function selectLivingTogetherInSameProperty() {
  completeLivingTogetherPage(this, selectContent.yes);
}

function selectDoNotLiveTogetherInSameProperty() {
  completeLivingTogetherPage(this, selectContent.no);
}

function completeLivingTogetherPage(I, chosenOption) {
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(chosenOption);
  I.navByClick('Continue');
}


module.exports = {
  selectLivingTogetherInSameProperty,
  selectDoNotLiveTogetherInSameProperty
};