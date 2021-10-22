const moment = require('moment');

const cardExpiryYear = moment().add(2, 'years')
  .format('Y');

const applicationFee = '£593.00';

function payOnGovPay() {
  const I = this;

  onGovPay(this);
  I.fillField('cardNo', '4444333322221111');
  I.fillField('expiryMonth', '10');
  I.fillField('expiryYear', cardExpiryYear);
  I.fillField('cardholderName', 'Bob Boomerang');
  I.fillField('cvc', '999');
  I.fillField('addressLine1', '80 Landor Road');
  I.fillField('addressCity', 'London');
  I.fillField('addressPostcode', 'SW9 9PE');
  I.fillField('email', 'simulate-delivered+divorce@notifications.service.gov.uk');
  I.navByClick('Continue');
  I.waitInUrl('/confirm');
  I.navByClick('Confirm payment');
  I.wait(10);
}

function payOnGovPayFailure() {
  const I = this;

  onGovPay(this);
  I.fillField('cardNo', '4000000000000002');
  I.fillField('expiryMonth', '10');
  I.fillField('expiryYear', cardExpiryYear);
  I.fillField('cardholderName', 'Bob Boomerang');
  I.fillField('cvc', '999');
  I.fillField('addressLine1', '80 Landor Road');
  I.fillField('addressCity', 'London');
  I.fillField('addressPostcode', 'SW9 9PE');
  I.fillField('email', 'simulate-delivered+divorce@notifications.service.gov.uk');
  I.navByClick('Continue');
  I.waitForText('Your payment has been declined');
  I.navByClick('Continue');
}

function cancelOnGovPay() {
  const I = this;

  onGovPay(this);
  I.navByClick('Cancel payment');
  I.waitInUrl('/cancel');
  I.see('Your payment has been cancelled');
  I.navByClick('Continue');
}

function onGovPay(I) {
  I.wait(3);
  I.waitForText('Enter card details', 20);
  I.waitInUrl('www.payments.service.gov.uk/card_details');
  I.see(applicationFee);
}

module.exports = { payOnGovPay, payOnGovPayFailure, cancelOnGovPay };
