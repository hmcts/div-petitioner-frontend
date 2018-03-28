const Page = require('app/core/steps/Page');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ApplicationSubmitted extends Page {
  get url() {
    return '/application-submitted';
  }

  get nextStep() {
    return this.steps.PayOnline;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  interceptor(ctx) {
    ctx.nextStepUrl = this.nextStep.url;
    return ctx;
  }
};
