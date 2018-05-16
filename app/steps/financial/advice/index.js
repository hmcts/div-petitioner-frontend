const Step = require('app/core/steps/Step');

module.exports = class FinancialAdvice extends Step {
  get url() {
    return '/about-divorce/financial/advice';
  }
  get nextStep() {
    return this.steps.ClaimCosts;
  }

  interceptor(ctx) {
    ctx.nextStepUrl = this.nextStep.url;
    return ctx;
  }
};
