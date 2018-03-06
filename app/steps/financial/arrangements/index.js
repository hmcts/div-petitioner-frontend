const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class FinancialArrangements extends OptionStep {
  get url() {
    return '/about-divorce/financial/arrangements';
  }
  get nextStep() {
    return {
      financialOrder: {
        Yes: this.steps.FinancialAdvice,
        No: this.steps.ClaimCosts
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('financialOrder', (previousSession, session, remove) => {
      if (session.financialOrder === 'No') {
        remove('financialOrderFor');
      }
    });
  }

  * validate(ctx, session) {
    const [isValid, errors] = yield super.validate(ctx, session);

    const removeUnWantedErrors = error => {
      return error.param === 'financialOrderFor';
    };

    const removeObsoliteErrors = error => {
      return error.param === 'financialOrder';
    };

    if (!isValid) {
      if (ctx.financialOrder === 'Yes') {
        return [isValid, errors.filter(removeUnWantedErrors)];
      }
      return [isValid, errors.filter(removeObsoliteErrors)];
    }

    return [isValid, errors];
  }

  action(ctx, session) {
    if (ctx.financialOrder === 'No') {
      delete ctx.financialOrderFor;
      delete session.financialOrderFor;
    }
    return [ctx, session];
  }
};
