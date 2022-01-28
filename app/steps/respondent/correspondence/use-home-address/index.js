const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const { resetRespondentSolicitorData } = require('../../../../core/utils/respondentSolicitorSearchHelper');

module.exports = class RespondentCorrespondenceUseHomeAddress extends ValidationStep {
  get url() {
    return '/petitioner-respondent/respondent-correspondence/use-home-address';
  }

  get nextStep() {
    return {
      respondentCorrespondenceUseHomeAddress: {
        Yes: this.steps.ReasonForDivorce,
        No: this.steps.RespondentCorrespondenceAddress,
        Solicitor: this.steps.RespondentCorrespondenceSolicitorSearch
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('respondentCorrespondenceUseHomeAddress', (previousSession, session, remove) => {
      if (session.respondentContactDetailsConfidential === 'keep') {
        remove('respondentCorrespondenceAddress');
      }

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

  setRespSolToggle(ctx, session) {
    ctx.isRespSolToggleOn = session.featureToggles.ft_represented_respondent_journey;
  }

  setRespondentCorrespondenceDisplayAnswer(ctx, session) {
    if (ctx.isRespSolToggleOn === true) {
      if (ctx.respondentCorrespondenceUseHomeAddress === 'Yes') {
        ctx.respondentCorrespondenceWherePaperSent = this.getDestinationResponse(session, 'theirAddress');
      } else if (ctx.respondentCorrespondenceUseHomeAddress === 'No') {
        ctx.respondentCorrespondenceWherePaperSent = this.getDestinationResponse(session, 'anotherAddress');
      } else {
        ctx.respondentCorrespondenceWherePaperSent = this.getDestinationResponse(session, 'solicitorAddress');
      }
    }
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
    this.setRespSolToggle(ctx, session);
    this.setRespondentCorrespondenceDisplayAddress(ctx, session);
    return ctx;
  }

  action(ctx, session) {
    if (ctx.respondentCorrespondenceUseHomeAddress === 'Yes') {
      session.respondentCorrespondenceAddress = session.respondentHomeAddress;
    }
    // remove data used for template
    delete session.respondentCorrespondenceDisplayAddress;
    delete ctx.respondentCorrespondenceDisplayAddress;
    delete ctx.respondentCorrespondenceWherePaperSent;

    // remove solicitor data (if exists) when option changes
    if (ctx.respondentCorrespondenceUseHomeAddress !== 'Solicitor') {
      resetRespondentSolicitorData(session);
    }

    return [ctx, session];
  }

  getDestinationResponse(session, option) {
    return this.content.resources[session.language].translation.content.featureToggleRespSol[option];
  }

  checkYourAnswersInterceptor(ctx, session) {
    this.setRespondentCorrespondenceDisplayAnswer(ctx, session);
    this.setRespondentCorrespondenceDisplayAddress(ctx, session);
    return ctx;
  }
};
