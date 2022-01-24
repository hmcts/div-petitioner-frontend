const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const logging = require('@hmcts/nodejs-logging');

module.exports = class RespondentLivesAtLastAddress extends ValidationStep {
  get url() {
    return '/petitioner-respondent/lives-at-this-address';
  }
  get nextStep() {
    return {
      respondentLivesAtLastAddress: {
        Yes: this.steps.RespondentCorrespondenceUseHomeAddress,
        No: this.steps.RespondentHomeAddress,
        Unknown: this.steps.RespondentCorrespondenceSendToSolicitor
      }
    };
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('livingArrangementsLastLivedTogetherAddress', (previousSession, session, remove) => {
      const loggerInstance = logging.Logger.getLogger('name');
      loggerInstance.info('MEEEEEE watch respondentLivesAtLastAddress');
      remove('respondentLivesAtLastAddress');
    });
  }

  action(ctx, session) {
    const loggerInstance = logging.Logger.getLogger('name');
    loggerInstance.info(`MEEEEEE respondentLivesAtLastAddress ${ctx.respondentLivesAtLastAddress}`);
    if (ctx.respondentLivesAtLastAddress === 'Yes') {
      ctx.livingArrangementsLastLivedTogetherAddress = session.livingArrangementsLastLivedTogetherAddress; // eslint-disable-line max-len
      // if the respondent lives here then this is their home address
      session.respondentHomeAddress = session.livingArrangementsLastLivedTogetherAddress; // eslint-disable-line max-len
    }

    return [ctx, session];
  }

  checkYourAnswersInterceptor(ctx, session) {
    const loggerInstance = logging.Logger.getLogger('name');
    ctx.livingArrangementsLastLivedTogetherAddress = session.livingArrangementsLastLivedTogetherAddress; // eslint-disable-line max-len
    loggerInstance.info(`MEEEEEE checkYourAnswersInterceptor ${JSON.stringify(ctx.livingArrangementsLastLivedTogetherAddress)}`);
    return ctx;
  }
};
