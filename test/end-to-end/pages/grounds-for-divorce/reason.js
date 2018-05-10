function selectReasonForDivorce(reason) {

  const I = this;

  I.seeCurrentUrlEquals('/about-divorce/reason-for-divorce/reason');
  I.waitForText(reason);
  I.checkOption(reason);
  I.navByClick('Continue');
}
module.exports = { selectReasonForDivorce };