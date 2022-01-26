const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const logging = require('@hmcts/nodejs-logging');

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
    const loggerInstance = logging.Logger.getLogger('name');
    if (ctx.livingArrangementsLastLivedTogether === 'Yes') {
      // copy petitioner home address as last place they lived together
      loggerInstance.info(`MEEEEEE action LastLivedTogether ${ctx.livingArrangementsLastLivedTogether}`);
      ctx.livingArrangementsLastLivedTogetherAddress = session.petitionerHomeAddress; // eslint-disable-line max-len
    } else {
      delete session.livingArrangementsLastLivedTogetherAddress;
    }

    return [ctx, session];
  }
};
