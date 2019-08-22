const content = require('app/steps/jurisdiction/interstitial/content.json').resources.en.translation.content;
const pagePath = '/jurisdiction/interstitial';

function chooseJurisdictionInterstitialContinue() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.retry(2).click(content.confident);
  I.navByClick('Continue');
}

function chooseJurisdictionInterstitialNeedInfo() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);
  I.checkOption(content.needInfo);
  I.navByClick('Continue');
}

module.exports = { chooseJurisdictionInterstitialContinue, chooseJurisdictionInterstitialNeedInfo };