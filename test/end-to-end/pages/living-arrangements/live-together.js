const selectContent = require('app/steps/living-arrangements/live-together/content.json').resources.en.translation.content;
const selectContentCy = require('app/steps/living-arrangements/live-together/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/live-together';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectLivingTogetherInSameProperty(language = 'en') {
  const liveTogether = language === 'en' ? selectContent : selectContentCy;
  completeLivingTogetherPage(this, liveTogether.yes, language);
}

function selectDoNotLiveTogetherInSameProperty(language = 'en') {
  const liveTogether = language === 'en' ? selectContent : selectContentCy;
  completeLivingTogetherPage(this,liveTogether.no, language);
}

function completeLivingTogetherPage(I, chosenOption, language) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;

  I.waitInUrl(pagePath);
  I.seeInCurrentUrl(pagePath);
  I.checkOption(chosenOption);
  I.waitForContinueButtonEnabled();
  I.click(commonContent.continue);
}

module.exports = {
  selectLivingTogetherInSameProperty,
  selectDoNotLiveTogetherInSameProperty
};
