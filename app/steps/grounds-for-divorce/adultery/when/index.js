const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class AdulteryWhen extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/when';
  }
  get nextStep() {
    return this.steps.AdulteryDetails;
  }
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdulteryKnowWhen');
      }
    });
  }
};
