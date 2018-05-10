const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class AdulteryWishToName extends OptionStep {
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
  handler(req, res) {
    return runStepHandler(this, req, res);
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
