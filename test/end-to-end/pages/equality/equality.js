const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;

async function completeEquality() {
  const I = this;

  // Wait for page to load
  I.wait(3);
  const url = await I.grabCurrentUrl();

  if (url.startsWith(pcqAAT)) {
    I.seeCurrentUrlEquals(pagePath);

    await I.navByClick('I don\'t want to answer these questions');
    I.wait(5);
  }
}

async function completeEqualityCy() {
  const I = this;

  // Wait for page to load
  I.wait(3);
  const url = await I.grabCurrentUrl();

  if (url.startsWith(pcqAAT)) {
    I.seeCurrentUrlEquals(pagePath);

    await I.navByClick('Dydw i ddim eisiau ateb y cwestiynau hyn');
    I.wait(5);
  }
}

module.exports = { completeEquality, completeEqualityCy };
