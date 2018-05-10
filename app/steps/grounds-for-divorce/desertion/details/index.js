const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class DesertionDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/desertion/details';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove('reasonForDivorceDesertionDetails');
    });
  }

  * validate(ctx, session) {
    let [isValid, errors] = yield super.validate(ctx, session); // eslint-disable-line prefer-const

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
