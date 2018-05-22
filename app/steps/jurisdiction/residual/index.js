const ValidationStep = require('app/core/steps/ValidationStep');
const { applyConnections, clearProceedingSteps } = require('app/services/jurisdiction/connections');

module.exports = class JurisdictionResidual extends ValidationStep {
  get url() {
    return '/jurisdiction/residual';
  }
  get nextStep() {
    return {
      residualJurisdictionEligible: {
        Yes: this.steps.JurisdictionConnectionSummary,
        No: this.steps.ExitNoConnections
      }
    };
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
