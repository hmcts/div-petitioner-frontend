const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentHomeAddressIsKnown extends ValidationStep {
  get url() {
    return '/petitioner-respondent/is-home-address-known';
  }
  get nextStep() {
    return {
      respondentKnowsHomeAddress: {
        Yes: this.steps.RespondentHomeAddress,
        No: this.steps.RespondentCorrespondenceSendToSolicitor
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch(['respondentLivesAtLastAddress', 'livingArrangementsLastLivedTogether'], (previousSession, session, remove) => {
      remove('respondentKnowsHomeAddress');
    });
  }

  action(ctx, session) {
    let newCtx = ctx;
    if (ctx.respondentKnowsHomeAddress === 'No') {
      newCtx = { respondentKnowsHomeAddress: ctx.respondentKnowsHomeAddress };
    }

    return [newCtx, session];
  }
};
