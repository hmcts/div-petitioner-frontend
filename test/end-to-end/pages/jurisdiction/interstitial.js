const content = require('app/steps/jurisdiction/interstitial/content.json').resources.en.translation.content;

function chooseJurisdictionInterstitialContinue() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/interstitial');
  I.checkOption(content.confident);
  I.navByClick('Continue');
}

function chooseJurisdictionInterstitialNeedInfo() {

  const I = this;

  I.seeCurrentUrlEquals('/jurisdiction/interstitial');
  I.checkOption(content.needInfo);
  I.navByClick('Continue');
}

module.exports = { chooseJurisdictionInterstitialContinue, chooseJurisdictionInterstitialNeedInfo };