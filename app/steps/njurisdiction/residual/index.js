const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { applyConnections, clearProceedingSteps } = require('app/services/jurisdiction/connections');

module.exports = class JurisdictionResidual extends OptionStep {
  get url() {
    return '/njurisdiction/residual';
  }
  get nextStep() {
    return {
      residualJurisdictionEligible: {
        Yes: this.steps.JurisdictionConnectionSummary,
        No: this.steps.ExitNoConnections
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
