const ValidationStep = require('app/core/steps/ValidationStep');
const { applyConnections, hasLivedMonths, hasOnlyConnection, clearProceedingSteps } = require('app/services/jurisdiction/connections');
const { isEmpty } = require('lodash');

const TWELVE_MONTHS = 12;

module.exports = class JurisdictionLastTwelveMonths extends ValidationStep {
  get url() {
    return '/jurisdiction/last-twelve-months';
  }

  get nextStep() {
    return {

      jurisdictionWhereTo: {

        JurisdictionInterstitial: this.steps.JurisdictionInterstitial,
        JurisdictionDomicile: this.steps.JurisdictionDomicile
      }
    };
  }

  next(ctx, session) {
    const nextStepLogicHelper = {};

    if (hasLivedMonths(TWELVE_MONTHS, this.name, ctx, session)) {
      if (isEmpty(session.jurisdictionConnection) || hasOnlyConnection(session.jurisdictionConnection, 'D')) {
        nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionInterstitial';
      } else {
        nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionDomicile';
      }
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionDomicile';
    }

    return super.next(nextStepLogicHelper);
  }

  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
