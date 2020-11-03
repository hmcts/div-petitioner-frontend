const pagePath = '/about-divorce/reason-for-divorce/reason';

function selectReasonForDivorce(reason) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.waitForText(reason);
  I.checkOption(reason);
  I.navByClick('Continue');
}
async function selectReasonForDivorceCy(reason) {

  const I = this;
  let pagePath = await I.getCurrentPageUrl();
  I.waitInUrl(pagePath, 5);
  I.seeInCurrentUrl(pagePath);

  I.waitForText(reason);
  I.checkOption(reason);
  await I.navByClick('Parhau');
}

module.exports = { selectReasonForDivorce, selectReasonForDivorceCy };
