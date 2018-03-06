const content = require('app/steps/njurisdiction/interstitial/content.json').resources.en.translation.content;

function chooseJurisdictionInterstitialContinue() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/interstitial');
  I.checkOption(content.confident);
  I.click('Continue');
}

function chooseJurisdictionInterstitialNeedInfo() {

  const I = this;

  I.seeCurrentUrlEquals('/njurisdiction/interstitial');
  I.checkOption(content.needInfo);
  I.click('Continue');
}

module.exports = { chooseJurisdictionInterstitialContinue, chooseJurisdictionInterstitialNeedInfo };