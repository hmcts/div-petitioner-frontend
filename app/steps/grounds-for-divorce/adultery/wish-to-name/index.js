const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class AdulteryWishToName extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/wish-to-name';
  }
  get nextStep() {
    return {
      reasonForDivorceAdulteryWishToName: {
        Yes: this.steps.Adultery3rdPartyDetails,
        No: this.steps.AdulteryWhere
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'adultery') {
        remove('reasonForDivorceAdulteryWishToName');
      }
    });
  }
};
