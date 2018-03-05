const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');
const { applyConnections, clearProceedingSteps } = require('app/services/jurisdiction/connections');
const { isEmpty, merge } = require('lodash');

const cyaContent = require('app/services/jurisdiction/content.json');

module.exports = class JurisdictionLastResort extends OptionStep {
  constructor(...args) {
    super(...args);

    watch([
      'jurisdictionPetitionerDomicile', 'jurisdictionRespondentDomicile',
      'jurisdictionPetitionerResidence', 'jurisdictionRespondentResidence',
      'jurisdictionLast6Months', 'jurisdictionLastHabitualResident',
      'jurisdictionLastSixMonths', 'jurisdictionLastTwelveMonths'
    ], (previousSession, session, remove) => {
      remove('jurisdictionLastResortConnections');
    });

    // extend this pages content with the CYA content
    merge(this.content, cyaContent);
  }

  get url() {
    return '/njurisdiction/last-resort';
  }

  get nextStep() {
    return {
      isConnected: {

        true: this.steps.PetitionerConfidential,
        false: this.steps.ExitJurisdiction
      }
    };
  }

  next(ctx, session) {
    const nextStepLogicHelper = {
      isConnected: !isEmpty(
        session.jurisdictionConnection
      )
    };

    return super.next(nextStepLogicHelper);
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }

  checkYourAnswersInterceptor(ctx/* , session*/) {
    ctx.changeLink = true;
    return ctx;
  }
};
