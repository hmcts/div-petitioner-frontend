const language = 'en';

Feature('Payment method @functional').retry(3);

xScenario('Fee displays on /pay/help/need-help page', function (I) {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.seeInCurrentUrl('/screening-questions/language-preference');
  I.amOnLoadedPage('/pay/help/need-help');
});

xScenario('Card payment online', async function (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(language,false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  I.confirmIWillPayOnline(language);
  const isPaymentOnStub = await I.getPaymentIsOnStub();
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});

xScenario('Card payment online failure', async function (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(language,false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  // Failure
  I.confirmIWillPayOnline(language);
  const isPaymentOnStub = await I.getPaymentIsOnStub();
  I.payFailureOnPaymentPage(isPaymentOnStub);
  I.waitInUrl('/pay/online');

  // Retry
  I.confirmIWillPayOnline(language);
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});

xScenario('Card payment online cancellation with retry', async function (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(language, false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  // Cancellation
  I.confirmIWillPayOnline(language);
  const isPaymentOnStub = await I.getPaymentIsOnStub();
  I.cancelOnPaymentPage(isPaymentOnStub);
  I.waitInUrl('/pay/online');

  // Retry
  I.confirmIWillPayOnline(language);
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});
