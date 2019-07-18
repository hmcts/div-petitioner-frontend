const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class AdulterySecondHandInfo extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/second-hand-information';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'adultery') {
        remove(
          'reasonForDivorceAdulterySecondHandInfo',
          'reasonForDivorceAdulterySecondHandInfoDetails'
        );
      }
    });
  }
};
