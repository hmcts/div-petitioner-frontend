const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class LegalProceedings extends ValidationStep {
  get url() {
    return '/about-divorce/legal-proceedings';
  }
  get nextStep() {
    return this.steps.FinancialArrangements;
  }

  constructor(...args) {
    super(...args);

    watch('legalProceedings', (previousSession, session, remove) => {
      if (session.legalProceedings === 'No') {
        remove('legalProceedingsRelated', 'legalProceedingsDetails');
      }
    });
  }

  validate(ctx, session) {
    const [isValid, errors] = super.validate(ctx, session);

    const removeUnWantedErrors = error => {
      return error.param !== 'legalProceedings';
    };

    const removeObsoliteErrors = error => {
      return error.param === 'legalProceedings';
    };

    if (!isValid) {
      if (ctx.legalProceedings === 'Yes') {
        return [isValid, errors.filter(removeUnWantedErrors)];
      }

      return [isValid, errors.filter(removeObsoliteErrors)];
    }

    return [isValid, errors];
  }

  action(ctx, session) {
    if (ctx.legalProceedings === 'No') {
      delete ctx.legalProceedingsRelated;
      delete ctx.legalProceedingsDetails;
    }

    return [ctx, session];
  }
};
