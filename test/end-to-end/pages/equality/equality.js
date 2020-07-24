// Change this to start-page once PCQ-Divorce is in AAT
const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/offline`;

async function completeEquality() {
  const I = this;

  // Wait for page to load
  I.wait(3);
  const url = await I.grabCurrentUrl();

  if (url.startsWith(pcqAAT)) {
    I.seeCurrentUrlEquals(pagePath);

    I.navByClick('Continue');
  }
}

module.exports = { completeEquality };
