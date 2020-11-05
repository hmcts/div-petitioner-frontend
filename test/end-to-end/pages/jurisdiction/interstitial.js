const contentEn = require('app/steps/jurisdiction/interstitial/content.json').resources.en.translation.content;
const contentCy = require('app/steps/jurisdiction/interstitial/content.json').resources.cy.translation.content;
const pagePath = '/jurisdiction/interstitial';
const commonContentEn = require('app/content/common-en').resources.en.translation;
const commonContentCy = require('app/content/common-cy').resources.cy.translation;

function chooseJurisdictionInterstitialContinue(language = 'en') {

  const commonContent = language === 'en' ? commonContentEn : commonContentCy;
  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  if (language === 'en') {
    I.retry(2).click(contentEn.confident);
    I.navByClick(commonContent.continue);
  } else {
    I.retry(2).click(contentCy.confident);
    I.navByClick(commonContent.continue);
  }
}

function chooseJurisdictionInterstitialNeedInfo() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(contentEn.needInfo);
  I.navByClick('Continue');
}

module.exports = { chooseJurisdictionInterstitialContinue, chooseJurisdictionInterstitialNeedInfo };
