const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class AdulteryWhen extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/when';
  }
  get nextStep() {
    return this.steps.AdulteryDetails;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdulteryKnowWhen');
      }
    });

    watch('reasonForDivorceAdulteryKnowWhen', (previousSession, session, remove) => {
      if (previousSession.reasonForDivorceAdulteryKnowWhen === 'No') {
        remove('reasonForDivorceAdulteryWhenDetails');
      }
    });
  }

  action(ctx, session) {
    if (ctx.reasonForDivorceAdulteryKnowWhen === 'No') {
      session.reasonForDivorceAdulteryWhenDetails = 'The applicant does not know when the adultery took place';
    }

    return [ctx, session];
  }
};
