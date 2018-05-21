const ValidationStep = require('app/core/steps/ValidationStep');
const {
  applyConnections,
  isHabitualResident,
  hasLivedMonths,
  isDomiciled,
  hasOnlyConnection,
  clearProceedingSteps
} = require('app/services/jurisdiction/connections');
const { isEmpty } = require('lodash');

const SIX_MONTHS = 6;

module.exports = class JurisdictionLastSixMonths extends ValidationStep {
  get url() {
    return '/jurisdiction/last-six-months';
  }

  get nextStep() {
    return {

      jurisdictionWhereTo: {

        JurisdictionInterstitial: this.steps.JurisdictionInterstitial,
        JurisdictionLastHabitualResidence:
          this.steps.JurisdictionLastHabitualResidence,
        JurisdictionConnectionSummary: this.steps.JurisdictionConnectionSummary

      }
    };
  }

  // @todo Refactor this to reduce complexity.
  next(ctx, session) { // eslint-disable-line complexity
    const nextStepLogicHelper = {};
    nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastHabitualResidence';

    if ((isEmpty(session.jurisdictionConnection) || hasOnlyConnection(session.jurisdictionConnection, 'E')) && isHabitualResident('petitioner', this.name, ctx, session) && hasLivedMonths(SIX_MONTHS, this.name, ctx, session) && isDomiciled('petitioner', this.name, ctx, session)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionInterstitial';
    } else if (session.jurisdictionConnection.includes('A')) {
      // DIV-837 Scenario 7,8
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionConnectionSummary';
    } else if (!session.jurisdictionConnection.includes('A') && isHabitualResident('petitioner', this.name, ctx, session) && !hasLivedMonths(SIX_MONTHS, this.name, ctx, session) && isDomiciled('petitioner', this.name, ctx, session)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastHabitualResidence';
    }

    return super.next(nextStepLogicHelper);
  }


  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
