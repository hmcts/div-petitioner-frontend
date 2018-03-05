const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');
const { setConnections } = require('app/services/oJurisdiction/connections');

module.exports = class LastResort extends OptionStep {
  get url() {
    return '/jurisdiction/last-resort';
  }

  get nextStep() {
    return {
      isConnected: {

        true: this.steps.PetitionerConfidential,
        false: this.steps.ExitJurisdiction
      }
    };
  }

  next(ctx) {
    const lastResort = ctx.jurisdictionLastResort;
    const hasLastResort = lastResort && lastResort.length > 0;
    const nextStepLogicHelper = { isConnected: hasLastResort };

    return super.next(nextStepLogicHelper);
  }

  constructor(...args) {
    super(...args);

    watch(['jurisdictionDomicile', 'jurisdictionResidence', 'jurisdictionLast6Months', 'jurisdictionLast12Months'], (previousSession, session, remove) => {
      remove('jurisdictionLastResort');
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    if (!session.jurisdictionPath) {
      session.jurisdictionPath = [];
    }

    session.jurisdictionPath.push(this.name);
    setConnections(ctx, session, this);

    return [ctx, session];
  }
};
