const content = require('app/steps/jurisdiction/interstitial/content.json').resources.en.translation.content;
const contentCy = require('app/steps/jurisdiction/interstitial/content.json').resources.cy.translation.content;
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

async function chooseJurisdictionInterstitialContinueCy() {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);
  I.retry(2).click(contentCy.confident);
  await I.navByClick('Parhau');
}

module.exports = { chooseJurisdictionInterstitialContinue, chooseJurisdictionInterstitialNeedInfo, chooseJurisdictionInterstitialContinueCy };
