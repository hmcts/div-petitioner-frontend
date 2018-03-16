const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const {
  applyConnections, isHabitualResident, areBothHabituallyResident,
  clearJurisdictionSections, clearProceedingSteps
} = require('app/services/jurisdiction/connections');

module.exports = class JurisdictionHabitualResidence extends OptionStep {
  get url() {
    return '/jurisdiction/habitual-residence';
  }

  get nextStep() {
    return {

      jurisdictionWhereTo: {

        JurisdictionInterstitial: this.steps.JurisdictionInterstitial,
        JurisdictionLastTwelveMonths: this.steps.JurisdictionLastTwelveMonths,
        JurisdictionDomicile: this.steps.JurisdictionDomicile
      }
    };
  }

  next(ctx, session) {
    const nextStepLogicHelper = {};

    if (areBothHabituallyResident(this.name, ctx, session) || isHabitualResident('respondent', this.name, ctx, session)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionInterstitial';
    } else if (isHabitualResident('petitioner', this.name, ctx, session)) {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastTwelveMonths';
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionDomicile';
    }

    return super.next(nextStepLogicHelper);
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    clearJurisdictionSections(session);
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
