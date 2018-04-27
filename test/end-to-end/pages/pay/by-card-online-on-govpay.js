const moment = require('moment');

const cardExpiryYear = moment().add(2, 'years').format('Y');

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
  I.click('Continue');
  I.waitInUrl('/confirm');
  I.click('Confirm payment');
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
  I.click('Continue');
  I.waitForText('Your payment has been declined');
  I.click('Go back to try the payment again');
}

function cancelOnGovPay() {

  const I = this;

  onGovPay(this);
  I.click('Cancel payment');
  I.waitInUrl('/cancel');
  I.see('Your payment has been cancelled');
  I.click('Go back to the service');
}

function onGovPay(I) {
  I.wait(3);
  I.waitForText('Enter card details', 20);
  I.seeInCurrentUrl('www.payments.service.gov.uk/card_details');
  I.see('£550.00');
}

module.exports = { payOnGovPay, payOnGovPayFailure, cancelOnGovPay };
