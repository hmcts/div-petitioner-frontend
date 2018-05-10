const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class Adultery3rdPartyDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/name-person';
  }

  get nextStep() {
    return this.steps.Adultery3rdPartyAddress;
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
