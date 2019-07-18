const payHelpContent = require('app/steps/help/need-help/content.json').resources.en.translation.content;
const payHelpFeeContent = payHelpContent.explanation.replace('<strong>£{{ feeToBePaid }}</strong>', '£550');

Feature('Payment method').retry(3);

Scenario('Fee displays on /pay/help/need-help page', function (I) {
  I.amOnLoadedPage('/index');
  I.startApplication();
  I.seeCurrentUrlEquals('/screening-questions/has-marriage-broken');
  I.amOnLoadedPage('/pay/help/need-help');
  I.waitForText(payHelpContent.question);
  I.see(payHelpFeeContent);
});

Scenario('Card payment online', function* (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  I.confirmIWillPayOnline();
  const isPaymentOnStub = yield I.getPaymentIsOnStub();
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});


Scenario('Card payment online failure', function* (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  // Failure
  I.confirmIWillPayOnline();
  const isPaymentOnStub = yield I.getPaymentIsOnStub();
  I.payFailureOnPaymentPage(isPaymentOnStub);
  I.waitInUrl('/pay/online');

  // Retry
  I.confirmIWillPayOnline();
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});

Scenario('Card payment online cancellation with retry', function* (I) {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  // Cancellation
  I.confirmIWillPayOnline();
  const isPaymentOnStub = yield I.getPaymentIsOnStub();
  I.cancelOnPaymentPage(isPaymentOnStub);
  I.waitInUrl('/pay/online');

  // Retry
  I.confirmIWillPayOnline();
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});