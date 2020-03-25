const ExitStep = require('app/core/steps/ExitStep');

module.exports = class AwaitingPaymentStatus extends ExitStep {
  get url() {
    return '/pay/awaiting-payment-status';
  }
};
