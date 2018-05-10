const { last, clone } = require('lodash');
const ValidationStep = require('app/core/steps/ValidationStep');
const {
  applyConnections,
  areBothDomiciled,
  areBothNotDomiciled,
  isHabitualResident,
  areBothHabituallyResident,
  hasLivedMonths,
  isDomiciled,
  clearProceedingSteps
} = require('app/services/jurisdiction/connections');

const TWELVE_MONTHS = 12;

module.exports = class JurisdictionDomicile extends ValidationStep {
  get url() {
    return '/jurisdiction/domicile';
  }

  get nextStep() {
    return {

      jurisdictionWhereTo: {

        JurisdictionInterstitial: this.steps.JurisdictionInterstitial,
        JurisdictionLastSixMonths: this.steps.JurisdictionLastSixMonths,
        JurisdictionLastHabitualResidence:
          this.steps.JurisdictionLastHabitualResidence,
        JurisdictionConnectionSummary: this.steps.JurisdictionConnectionSummary
      }
    };
  }

  // @todo Refactor this to reduce complexity.
  next(ctx, session) { // eslint-disable-line complexity
    const nextStepLogicHelper = {};

    // clone the current session to enable us to calcule the next step
    const clonedSession = clone(session);

    // clear proceding steps data from cloned session
    // this is because logic for the next step use data answered in proceeding questions
    clearProceedingSteps(clonedSession, this);

    // apply connections at this stage in the jurisidcition wizard which
    // will allow us to figure out the correct next step to go to
    applyConnections(this.name, ctx, clonedSession);

    const noPriorConnections = last(clonedSession.jurisdictionConnection) === 'F' && clonedSession.jurisdictionConnection.length === 1;

    const bothDomiciledNextStep = nextStep => {
      if (areBothHabituallyResident(this.name, ctx, clonedSession) && !hasLivedMonths(TWELVE_MONTHS, this.name, ctx, clonedSession)) {
        nextStep.jurisdictionWhereTo = 'JurisdictionLastSixMonths';
      } else {
        nextStep.jurisdictionWhereTo = (!isHabitualResident('petitioner', this.name, ctx, clonedSession) && isHabitualResident('respondent', this.name, ctx, clonedSession)) ? 'JurisdictionLastHabitualResidence' : 'JurisdictionConnectionSummary';
      }
      return nextStep.jurisdictionWhereTo;
    };

    if (noPriorConnections && areBothDomiciled(this.name, ctx, clonedSession)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionInterstitial';
    } else if (!clonedSession.jurisdictionConnection.includes('A') && isHabitualResident('petitioner', this.name, ctx, clonedSession) && (areBothDomiciled(this.name, ctx, clonedSession) || isDomiciled('petitioner', this.name, ctx, clonedSession))) {
      nextStepLogicHelper.jurisdictionWhereTo = hasLivedMonths(TWELVE_MONTHS, this.name, ctx, clonedSession) ? 'JurisdictionLastHabitualResidence' : 'JurisdictionLastSixMonths';
    } else if (areBothDomiciled(this.name, ctx, clonedSession)) {
      nextStepLogicHelper.jurisdictionWhereTo = bothDomiciledNextStep(
        nextStepLogicHelper
      );
    } else if (this.isRDomiciledOrBothNotDomiciledAndOnlyConnectionA(clonedSession, ctx) || this.hasConnectionAHabituallyResident12mn(clonedSession, ctx)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionConnectionSummary';
    } else if (this.hasConnectionAHabituallyResident6mn(clonedSession, ctx)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastSixMonths';
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastHabitualResidence';
    }

    return super.next(nextStepLogicHelper);
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }

  hasConnectionAHabituallyResident12mn(session, ctx) {
    return session.jurisdictionConnection.includes('A') && hasLivedMonths(TWELVE_MONTHS, this.name, ctx, session) && (areBothDomiciled(this.name, ctx, session) || isDomiciled('petitioner', this.name, ctx, session));
  }

  hasConnectionAHabituallyResident6mn(session, ctx) {
    return session.jurisdictionConnection.includes('A') && !hasLivedMonths(TWELVE_MONTHS, this.name, ctx, session) && isDomiciled('petitioner', this.name, ctx, session);
  }

  isRDomiciledOrBothNotDomiciledAndOnlyConnectionA(session, ctx) {
    return session.jurisdictionConnection.includes('A') && ((isDomiciled('respondent', this.name, ctx, session) && !areBothDomiciled(this.name, ctx, session)) || areBothNotDomiciled(this.name, ctx, session));
  }
};
