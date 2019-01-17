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

    watch('reasonForDivorceAdulterySecondHandInfo', (previousSession, session, remove) => {
      if (previousSession.reasonForDivorceAdulterySecondHandInfo === 'No') {
        remove('reasonForDivorceAdulterySecondHandInfoDetails');
      }
    });
  }
};
