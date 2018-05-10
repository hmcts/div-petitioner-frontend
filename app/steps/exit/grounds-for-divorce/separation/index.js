const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class ExitSeparation extends Step {
  get url() {
    return '/exit/separation';
  }
  get nextStep() {
    return null;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  interceptor(ctx, session) {
    const reasonForDivorce = session.reasonForDivorce;


    switch (reasonForDivorce) {
    case 'separation-2-years':
      ctx.limitYears = '2';
      break;
    case 'separation-5-years':
      ctx.limitYears = '5';
      break;
    default:
      ctx.limitYears = '';
      break;
    }

    return ctx;
  }
};
