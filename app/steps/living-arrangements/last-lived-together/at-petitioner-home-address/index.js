const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class LastLivedTogether extends ValidationStep {
  get url() {
    return '/petitioner-respondent/last-lived-together';
  }
  get nextStep() {
    return {
      livingArrangementsLastLivedTogether: {
        Yes: this.steps.RespondentHomeAddressIsKnown,
        No: this.steps.LastLivedTogetherAddress,
        Never: this.steps.RespondentHomeAddressIsKnown
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('livingArrangementsLiveTogether', (previousSession, session, remove) => {
      remove('livingArrangementsLastLivedTogether');
    });

    watch('petitionerHomeAddress', (previousSession, session, remove) => {
      remove('livingArrangementsLastLivedTogether', 'livingArrangementsLastLivedTogetherAddress');
    });
  }


  action(ctx, session) {
    if (ctx.livingArrangementsLastLivedTogether === 'Yes') {
      // copy petitioner home address as last place they lived together
      ctx.livingArrangementsLastLivedTogetherAddress = session.petitionerHomeAddress; // eslint-disable-line max-len
    } else {
      delete session.livingArrangementsLastLivedTogetherAddress;
    }

    return [ctx, session];
  }
};
