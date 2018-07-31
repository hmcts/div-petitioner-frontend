Feature('CCD Integration');

Scenario('Submitted case with Payment appears in CCD', async function (I) {
  I.startApplicationWithAnExistingSession();
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  I.confirmIWillPayOnline();
  const isPaymentOnStub = false;
  I.payOnPaymentPage(isPaymentOnStub);
  const caseId = await I.amDoneAndSubmitted();

  await I.checkMyCaseInCCD(caseId, 'payment');
});

Scenario('Submitted case with HWF appears in CCD', async function (I) {
  I.startApplicationWithAnExistingSession();
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();
  const caseId = await I.amDoneAndSubmitted();

  await I.checkMyCaseInCCD(caseId, 'HWF');
});