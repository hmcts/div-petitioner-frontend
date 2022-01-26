const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const { resetRespondentSolicitorData } = require('../../../../core/utils/respondentSolicitorSearchHelper');
const logging = require('@hmcts/nodejs-logging');

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
      const loggerInstance = logging.Logger.getLogger('name');
      if (session.respondentCorrespondenceUseHomeAddress !== 'Yes') {
        loggerInstance.info('MEEEEEE respondentCorrespondenceAddress removed');
        remove('respondentCorrespondenceAddress');
      }
    });

    watch('respondentHomeAddress', (previousSession, session, remove) => {
      const loggerInstance = logging.Logger.getLogger('name');
      if (session.respondentCorrespondenceUseHomeAddress === 'Yes') {
        loggerInstance.info('MEEEEEE respondentCorrespondenceAddress respondentCorrespondenceUseHomeAddress removed');
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
    const loggerInstance = logging.Logger.getLogger('name');
    loggerInstance.info('MEEEEEE setRespondentCorrespondenceDisplayAddress called');
    ctx.respondentCorrespondenceDisplayAddress = '';

    if (session.livingArrangementsLiveTogether === 'Yes') {
      ctx.respondentCorrespondenceDisplayAddress = session.petitionerHomeAddress; // eslint-disable-line max-len
    } else if (session.respondentHomeAddress) {
      loggerInstance.info(`MEEEEEE setRespondentCorrespondenceDisplayAddress respondentHomeAddress ${JSON.stringify(session.respondentContactDetailsConfidential)}`);
      loggerInstance.info(`MEEEEEE setRespondentCorrespondenceDisplayAddress respondentHomeAddress ${JSON.stringify(session.respondentHomeAddress)}`);
      if (session.respondentContactDetailsConfidential === 'share') {
        ctx.respondentCorrespondenceDisplayAddress = session.respondentHomeAddress; // eslint-disable-line max-len
      }
    } else if (session.livingArrangementsLastLivedTogetherAddress) {
      loggerInstance.info(`MEEEEEE setRespondentCorrespondenceDisplayAddress livingArrangementsLastLivedTogetherAddress ${JSON.stringify(session.livingArrangementsLastLivedTogetherAddress)}`);
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
      const loggerInstance = logging.Logger.getLogger('name');
      loggerInstance.info(`MEEEEEE action respondentCorrespondenceUseHomeAddress ${JSON.stringify(session.respondentHomeAddress)}`);
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
