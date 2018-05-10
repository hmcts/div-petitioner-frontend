const Step = require('app/core/steps/Step');

module.exports = class SubmittedError extends Step {
  get url() {
    return '/error-application-submitted';
  }

  get nextStep() {
    return this.steps.PayOnline;
  }

  interceptor(ctx) {
    ctx.nextStepUrl = this.nextStep.url;
    return ctx;
  }
};
