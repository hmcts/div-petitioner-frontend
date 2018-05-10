const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class DesertionDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/desertion/details';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove('reasonForDivorceDesertionDetails');
    });
  }

  validate(ctx, session) {
    let [isValid, errors] = super.validate(ctx, session); // eslint-disable-line prefer-const

    if (!isValid) {
      if (!ctx.reasonForDivorceDesertionDetails) {
        errors = errors.filter(error => {
          return error.param === 'reasonForDivorceDesertionDetails';
        }
        );
      }
    }

    return [isValid, errors];
  }
};
