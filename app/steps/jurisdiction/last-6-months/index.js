const OptionStep = require('app/core/OptionStep');
const getJurisdictionNextStep = require('app/services/jurisdictionFlow');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');
const { setConnections } = require('app/services/oJurisdiction/connections');

module.exports = class JurisdictionLast6Months extends OptionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/jurisdiction/last-6-months';
  }

  get nextStep() {
    return {
      jurisdictionWhereTo: {

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
        remove('jurisdictionLast6Months');
      }
    });

    watch('jurisdictionDomicile', (previousSession, session, remove) => {
      if (session.jurisdictionDomicile === 'respondent' || session.jurisdictionDomicile === 'neither') {
        remove('jurisdictionLast6Months');
      }
    });
  }

  action(ctx, session) {
    session.jurisdictionPath.push(this.name);
    setConnections(ctx, session, this);

    return [ctx, session];
  }
};
