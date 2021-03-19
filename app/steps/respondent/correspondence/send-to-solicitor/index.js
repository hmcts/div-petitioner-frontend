const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentCorrespondenceSendToSolicitor extends ValidationStep {
  get url() {
    return '/petitioner-respondent/correspondence/send-to-solicitor';
  }
  get nextStep() {
    return {
      respondentSolicitorRepresented: {
        Yes: this.steps.RespondentCorrespondenceSolicitorSearch,
        No: this.steps.RespondentCorrespondenceAddress
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentAskToUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentAskToUseHomeAddress === 'true') {
        remove('respondentSolicitorRepresented');
      }
    });
  }

  setRespSolToggle(ctx, session) {
    ctx.isRespSolToggleOn = session.featureToggles.ft_represented_respondent_journey;
  }

  interceptor(ctx, session) {
    this.setRespSolToggle(ctx, session);
    return ctx;
  }
};
