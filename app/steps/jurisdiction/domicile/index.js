const OptionStep = require('app/core/OptionStep');
const getJurisdictionNextStep = require('app/services/jurisdictionFlow');
const runStepHandler = require('app/core/handler/runStepHandler');
const { setConnections } = require('app/services/oJurisdiction/connections');

module.exports = class JurisdictionDomicile extends OptionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/jurisdiction/domicile';
  }

  get nextStep() {
    return {
      jurisdictionWhereTo: {

        JurisdictionLast12Months: this.steps.JurisdictionLast12Months,
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

  action(ctx, session) {
    session.jurisdictionPath.push(this.name);
    setConnections(ctx, session, this);

    return [ctx, session];
  }
};
