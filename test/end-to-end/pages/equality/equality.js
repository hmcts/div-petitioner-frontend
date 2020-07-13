// Change this to start-page once PCQ-Divorce is in AAT
const pagePath = 'https://pcq.aat.platform.hmcts.net/offline';

function completeEquality() {

  const I = this;

  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.navByClick('Continue');
}

module.exports = { completeEquality };
