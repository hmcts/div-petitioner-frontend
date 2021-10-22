const pcqAAT = 'https://pcq.aat.platform.hmcts.net';
const pagePath = `${pcqAAT}/start-page`;


async function completeEquality(language = 'en') {
  const I = this;
  const stepContent = language === 'en' ? 'I don\'t want to answer these questions' : 'Dydw i ddim eisiau ateb y cwestiynau hyn';
  I.wait(3);

  const url = await I.grabCurrentUrl();

  if (url.startsWith(pcqAAT)) {
    I.waitInUrl(pagePath);
    I.seeCurrentUrlEquals(pagePath);
    await I.navByClick(stepContent);
    I.wait(5);
  }
}

module.exports = { completeEquality };
