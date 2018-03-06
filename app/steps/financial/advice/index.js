const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class FinancialAdvice extends Step {
  get url() {
    return '/about-divorce/financial/advice';
  }
  get nextStep() {
    return this.steps.ClaimCosts;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  interceptor(ctx) {
    ctx.nextStepUrl = this.nextStep.url;
    return ctx;
  }
};
