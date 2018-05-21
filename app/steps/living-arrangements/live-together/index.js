const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class LiveTogether extends ValidationStep {
  get url() {
    return '/petitioner-respondent/live-together';
  }
  get nextStep() {
    return {
      livingArrangementsLiveTogether: {
        Yes: this.steps.RespondentCorrespondenceUseHomeAddress,
        No: this.steps.LastLivedTogether
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('petitionerHomeAddress', (previousSession, session, remove) => {
      if (session.livingArrangementsLiveTogether === 'Yes') {
        remove('respondentHomeAddress', 'livingArrangementsLiveTogether');
      }
    });
  }

  action(ctx, session) {
    if (ctx.livingArrangementsLiveTogether === 'No') {
      delete ctx.livingArrangementsLiveTogetherSeparated;
      delete session.respondentHomeAddress;
    } else if (session.petitionerHomeAddress) {
      //  if petitioner details are captured correctly, assign the home of the respondent
      //  to the home of the petitioner since they live together.
      ctx.respondentHomeAddress = session.petitionerHomeAddress;
    }

    return [ctx, session];
  }
};
