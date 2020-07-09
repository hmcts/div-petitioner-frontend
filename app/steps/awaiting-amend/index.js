const ExitStep = require('app/core/steps/ExitStep');

module.exports = class AwaitingAmend extends ExitStep {
  get url() {
    return '/awaiting-amend';
  }

  interceptor(ctx, session) {
    return super.interceptor(ctx, session);
  }
};
