const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;

async function completeEquality(language = 'en') {
  const I = this;
  I.wait(3);

  const url = await I.grabCurrentUrl();
  if (language === 'en') {
    if (url.startsWith(pcqAAT)) {
      I.seeCurrentUrlEquals(pagePath);
      await I.navByClick('I don\'t want to answer these questions');
      I.wait(5);
    }
  } else {
    if (url.startsWith(pcqAAT)) {
      I.seeCurrentUrlEquals(pagePath);
      await I.navByClick('Dydw i ddim eisiau ateb y cwestiynau hyn');
      I.wait(5);
    }

  }
}

module.exports = { completeEquality };
