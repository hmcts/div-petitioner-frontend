const ValidationStep = require('app/core/steps/ValidationStep');
const { merge } = require('lodash');
const { applyConnections, clearProceedingSteps } = require('app/services/jurisdiction/connections');

const cyaContent = require('app/services/jurisdiction/content.json');

module.exports = class JurisdictionConnectionSummary extends ValidationStep {
  constructor(...args) {
    super(...args);
    // extend this pages content with the CYA content
    merge(this.content, cyaContent);
  }

  get url() {
    return '/jurisdiction/connection-summary';
  }

  get nextStep() {
    return {
      jurisdictionWhereTo: {

        PetitionerConfidential: this.steps.PetitionerConfidential,
        JurisdictionHabitualResidence: this.steps.JurisdictionHabitualResidence,
        JurisdictionLastResort: this.steps.JurisdictionLastResort
      }
    };
  }

  next(ctx) {
    const nextStepLogicHelper = {};

    if (ctx.connectionSummary === 'Yes') {
      nextStepLogicHelper.jurisdictionWhereTo = 'PetitionerConfidential';
    } else if (ctx.connectionSummary === 'No') {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionHabitualResidence';
    } else {
      nextStepLogicHelper.jurisdictionWhereTo = 'JurisdictionLastResort';
    }

    return super.next(nextStepLogicHelper);
  }


  action(ctx, session) {
    clearProceedingSteps(session, this);

    applyConnections(this.name, ctx, session);

    return [ctx, session];
  }
};
