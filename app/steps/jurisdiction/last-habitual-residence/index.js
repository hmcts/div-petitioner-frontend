const ValidationStep = require('app/core/steps/ValidationStep');
const { isEmpty, last, clone } = require('lodash');
const {
  applyConnections, areBothLastHabitualResident,
  isEitherDomiciled, areBothDomiciled, clearProceedingSteps
} = require('app/services/jurisdiction/connections');

module.exports = class JurisdictionLastHabitualResidence extends ValidationStep {
  get url() {
    return '/jurisdiction/last-habitual-residence';
  }

  get nextStep() {
    return {

      jurisdictionWhereTo: {

        JurisdictionInterstitial: this.steps.JurisdictionInterstitial,
        JurisdictionConnectionSummary: this.steps.JurisdictionConnectionSummary,
        JurisdictionResidual: this.steps.JurisdictionResidual,
        ExitNoConnections: this.steps.ExitNoConnections
      }
    };
  }

  next(ctx, session) {
    const nextStepLogicHelper = {};

    // clone the current session to enable us to calcule the next step
    const clonedSession = clone(session);

    // clear proceding steps data from cloned session
    // this is because logic for the next step use data answered in proceeding questions
    clearProceedingSteps(clonedSession, this);

    // apply connections at this stage in the jurisidcition wizard which
    // will allow us to figure out the correct next step to go to
    applyConnections(this.name, ctx, clonedSession);

    const noPriorConnections = isEmpty(clonedSession.jurisdictionConnection) || last(clonedSession.jurisdictionConnection) === 'B';

    if (noPriorConnections && areBothLastHabitualResident(this.name, ctx, clonedSession)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionInterstitial';
    } else if (noPriorConnections && (clonedSession.marriageIsSameSexCouple === 'Yes' || isEitherDomiciled(this.name, ctx, clonedSession))) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionResidual';
    } else if (noPriorConnections && !areBothDomiciled(this.name, ctx, clonedSession)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'ExitNoConnections';
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionConnectionSummary';
    }

    return super.next(nextStepLogicHelper);
  }


  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
