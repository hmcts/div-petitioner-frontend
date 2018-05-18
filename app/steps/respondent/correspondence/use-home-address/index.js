const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class RespondentCorrespondenceUseHomeAddress extends ValidationStep {
  get url() {
    return '/petitioner-respondent/respondent-correspondence/use-home-address';
  }
  get nextStep() {
    return {
      respondentCorrespondenceUseHomeAddress: {
        Yes: this.steps.ReasonForDivorce,
        No: this.steps.RespondentCorrespondenceAddress,
        Solicitor: this.steps.RespondentSolicitorDetails
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentCorrespondenceUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentCorrespondenceUseHomeAddress !== 'Yes') {
        remove('respondentCorrespondenceAddress');
      }
    });

    watch('respondentHomeAddress', (previousSession, session, remove) => {
      if (session.respondentCorrespondenceUseHomeAddress === 'Yes') {
        remove('respondentCorrespondenceAddress', 'respondentCorrespondenceUseHomeAddress');
      }
    });
  }

  setRespondentCorrespondenceDisplayAddress(ctx, session) {
    ctx.respondentCorrespondenceDisplayAddress = '';

    if (session.livingArrangementsLiveTogether === 'Yes') {
      ctx.respondentCorrespondenceDisplayAddress = session.petitionerHomeAddress; // eslint-disable-line max-len
    } else if (session.respondentHomeAddress) {
      ctx.respondentCorrespondenceDisplayAddress = session.respondentHomeAddress; // eslint-disable-line max-len
    } else if (session.livingArrangementsLastLivedTogetherAddress) {
      ctx.respondentCorrespondenceDisplayAddress = session.livingArrangementsLastLivedTogetherAddress; // eslint-disable-line max-len
    }

    return ctx;
  }

  interceptor(ctx, session) {
    return this.setRespondentCorrespondenceDisplayAddress(ctx, session);
  }

  action(ctx, session) {
    if (ctx.respondentCorrespondenceUseHomeAddress === 'Yes') {
      session.respondentCorrespondenceAddress = session.respondentHomeAddress;
    }

    // remove data used for template
    delete session.respondentCorrespondenceDisplayAddress;
    delete ctx.respondentCorrespondenceDisplayAddress;

    return [ctx, session];
  }

  checkYourAnswersInterceptor(ctx, session) {
    return this.setRespondentCorrespondenceDisplayAddress(ctx, session);
  }
};
