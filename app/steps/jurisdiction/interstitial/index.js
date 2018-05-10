const ValidationStep = require('app/core/steps/ValidationStep');

const { first, clone, merge } = require('lodash');
const { hasLivedMonths, isHabitualResident, clearProceedingSteps, applyConnections } = require('app/services/jurisdiction/connections');

const cyaContent = require('app/services/jurisdiction/content.json');

const TWELVE_MONTHS = 12;

module.exports = class JurisdictionInterstitial extends ValidationStep {
  constructor(...args) {
    super(...args);
    // extend this pages content with the CYA content
    merge(this.content, cyaContent);
  }

  get url() {
    return '/jurisdiction/interstitial';
  }

  get nextStep() {
    return {
      jurisdictionWhereTo: {

        PetitionerConfidential: this.steps.PetitionerConfidential,
        JurisdictionLastTwelveMonths: this.steps.JurisdictionLastTwelveMonths,
        JurisdictionDomicile: this.steps.JurisdictionDomicile,
        JurisdictionLastSixMonths: this.steps.JurisdictionLastSixMonths,
        JurisdictionLastHabitualResidence:
          this.steps.JurisdictionLastHabitualResidence
      }
    };
  }

  next(ctx, session) {
    // clone the current session to enable us to calcule the next step
    const clonedSession = clone(session);

    // clear proceding steps data from cloned session
    // this is because logic for the next step use data answered in proceeding questions
    clearProceedingSteps(clonedSession, this);

    // apply connections at this stage in the jurisidcition wizard which
    // will allow us to figure out the correct next step to go to
    applyConnections(this.name, ctx, clonedSession);

    const nextStepLogicHelper = {};

    if (ctx.jurisdictionConfidentLegal === 'Yes') {
      nextStepLogicHelper.jurisdictionWhereTo = 'PetitionerConfidential';
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastHabitualResidence';
      //  make jurisdictionWhereTo dynamic based on last added connection
      //  in ctx.jurisdictionConnectionFirst. All interstitial pages are only reached
      //  when a connection is set
      //  alternatively make separate interstitial page steps for each set (this would be JurisdictionInterstitialAC)

      //  if petitioner is habitually resident
      if (clonedSession.jurisdictionConnection.includes('A') && !hasLivedMonths(TWELVE_MONTHS, this.name, ctx, clonedSession)) {
        nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastTwelveMonths';
      } else if (ctx.jurisdictionConnectionFirst === 'D' || ctx.jurisdictionConnectionFirst === 'C') {
        nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionDomicile';
      } else if (ctx.jurisdictionConnectionFirst === 'F') {
        if (isHabitualResident('petitioner', this.name, ctx, clonedSession) && !hasLivedMonths(TWELVE_MONTHS, this.name, ctx, clonedSession)) {
          nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastSixMonths';
        }
      }
    }

    return super.next(nextStepLogicHelper);
  }


  interceptor(ctx, session) {
    if (session.jurisdictionConnection) {
      // this is used by nunjucks to use applicable copy.
      ctx.jurisdictionConnectionFirst = first(session.jurisdictionConnection);
    }

    return ctx;
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
