const payHelpContent = require('app/steps/help/need-help/content.json').resources.en.translation.content;

const applicationFee = '£593';
const payHelpFeeContent = payHelpContent.explanation.replace('<strong>£{{ feeToBePaid }}</strong>', applicationFee);
const language = 'en';

Feature('Payment method @functional').retry(3);

Scenario('Fee displays on /pay/help/need-help page', I => {
  I.amOnLoadedPage('/');
  I.startApplication();
  I.seeInCurrentUrl('/screening-questions/language-preference');
  I.amOnLoadedPage('/pay/help/need-help');
  I.waitForText(payHelpContent.question);
  I.see(payHelpFeeContent);
});

Scenario('Card payment online', async I => {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(language, false);
  I.amOnLoadedPage('/check-your-answers');
  I.checkMyAnswers();

  I.confirmIWillPayOnline(language);
  const isPaymentOnStub = await I.getPaymentIsOnStub();
  I.payOnPaymentPage(isPaymentOnStub);
  I.amDoneAndSubmitted();
});

Scenario('Card payment online failure', async I => {
  I.startApplicationWith('basicDivorceSessionData');
  I.amOnLoadedPage('/pay/help/need-help');
  I.selectHelpWithFees(language, false);
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

Scenario('Card payment online cancellation with retry', async I => {
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
