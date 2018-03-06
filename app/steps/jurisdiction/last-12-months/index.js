const OptionStep = require('app/core/OptionStep');
const getJurisdictionNextStep = require('app/services/jurisdictionFlow');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');
const { setConnections } = require('app/services/oJurisdiction/connections');

module.exports = class JurisdictionLast12Months extends OptionStep {
  get url() {
    return '/jurisdiction/last-12-months';
  }

  get nextStep() {
    return {
      jurisdictionWhereTo: {

        JurisdictionLast6Months: this.steps.JurisdictionLast6Months,
        PetitionerConfidential: this.steps.PetitionerConfidential,
        LastResort: this.steps.LastResort
      }
    };
  }

  next(ctx, session) {
    const nextStepLogicHelper = {
      jurisdictionWhereTo: getJurisdictionNextStep(
        this, ctx, session
      )
    };
    return super.next(nextStepLogicHelper);
  }

  constructor(...args) {
    super(...args);

    watch('jurisdictionResidence', (previousSession, session, remove) => {
      if (session.jurisdictionResidence === 'respondent' || session.jurisdictionResidence === 'neither') {
        remove('jurisdictionLast12Months');
      }
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    session.jurisdictionPath.push(this.name);
    setConnections(ctx, session, this);

    return [ctx, session];
  }
};
