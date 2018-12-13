const Step = require('app/core/steps/Step');

module.exports = class ExitSixMonthRule extends Step {
  get url() {
    return '/exit/statement-of-case/separation-six-month-period';
  }

  get nextStep() {
    return null;
  }

  interceptor(ctx, session) {
    const reasonForDivorce = session.reasonForDivorce;
    if (reasonForDivorce === 'separation-5-years') {
      ctx.limitYears = '5';
    } else {
      ctx.limitYears = '2';
    }
    return ctx;
  }
};
