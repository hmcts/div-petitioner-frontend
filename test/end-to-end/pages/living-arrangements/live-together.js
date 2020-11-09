const selectContent = require('app/steps/living-arrangements/live-together/content.json').resources.en.translation.content;
const selectContentCy = require('app/steps/living-arrangements/live-together/content.json').resources.cy.translation.content;
const pagePath = '/petitioner-respondent/live-together';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function selectLivingTogetherInSameProperty(language = 'en') {
  completeLivingTogetherPage(this, selectContent.yes, language);
}

function selectDoNotLiveTogetherInSameProperty(language = 'en') {
  completeLivingTogetherPage(this,selectContent.no, language);
}

function completeLivingTogetherPage(I, chosenOption, language) {
  const commonContent = language === 'en' ? commonContentEn : commonContentCy;

  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  if (language === 'en') {
    I.checkOption(chosenOption);
    I.navByClick(commonContent.continue);
  } else {
    I.checkOption(selectContentCy.yes);
    I.navByClick(commonContent.continue);
  }

}

module.exports = {
  selectLivingTogetherInSameProperty,
  selectDoNotLiveTogetherInSameProperty
};
