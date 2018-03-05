const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class Adultery3rdPartyDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/name-person';
  }

  get nextStep() {
    return this.steps.Adultery3rdPartyAddress;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdultery3rdPartyFirstName', 'reasonForDivorceAdultery3rdPartyLastName');
      }
    });
  }
};
