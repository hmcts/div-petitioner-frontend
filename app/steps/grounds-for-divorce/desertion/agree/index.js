const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class DesertionAgree extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/desertion/agree';
  }
  get nextStep() {
    return {
      reasonForDivorceDesertionAgreed: {
        Yes: this.steps.DesertionDetails,
        No: this.steps.ExitDesertionAgree
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove('reasonForDivorceDesertionAgreed');
    });
  }
};
