const pagePath = '/about-divorce/reason-for-divorce/reason';

function selectReasonForDivorce(reason) {

  const I = this;
  I.waitInUrl(pagePath, 5);
  I.seeCurrentUrlEquals(pagePath);

  I.waitForText(reason);
  I.checkOption(reason);
  I.navByClick('Continue');
}
module.exports = { selectReasonForDivorce };