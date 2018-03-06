function payOnPaymentPage(isStub = true) {
  const I = this;

  if (isStub) {
    I.payOnStubPages();
  } else {
    I.payOnGovPay();
  }
}

function payFailureOnPaymentPage(isStub = true) {
  const I = this;

  if (isStub) {
    I.payOnStubPages(false);
  } else {
    I.payOnGovPayFailure();
  }
}

function cancelOnPaymentPage(isStub = true) {
  const I = this;

  if (isStub) {
    // currently Cancel returns exact same response from CCPay as Failure in live
    I.payOnStubPages(false);
  } else {
    I.cancelOnGovPay();
  }
}

module.exports = { payOnPaymentPage, payFailureOnPaymentPage, cancelOnPaymentPage };
