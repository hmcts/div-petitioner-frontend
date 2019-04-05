const Step = require('app/core/steps/Step');

module.exports = class SystemMessage extends Step {
  get url() {
    return '/system-message';
  }

  get nextStep() {
    return this.steps.NeedHelpWithFees;
  }

  interceptor(ctx) {
    ctx.nextStepUrl = this.nextStep.url;
    return ctx;
  }
};
