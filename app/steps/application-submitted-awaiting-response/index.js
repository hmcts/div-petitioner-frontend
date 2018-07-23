const Step = require('app/core/steps/Step');

module.exports = class ApplicationSubmittedAwaitingResponse extends Step {
  get url() {
    return '/application-submitted-awaiting-response';
  }
};