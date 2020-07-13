const Step = require('app/core/steps/Step');

module.exports = class AwaitingAmend extends Step {
  get url() {
    return '/awaiting-amend';
  }
};
