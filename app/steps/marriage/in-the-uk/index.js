const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

module.exports = class MarriedInUk extends OptionStep {
  get url() {
    return '/about-your-marriage/in-the-uk';
  }

  get nextStep() {
    let nextStep = {};

    if (features.jurisdiction) {
      nextStep = this.steps.JurisdictionResidence;
    } else if (features.newJurisdiction) {
      nextStep = this.steps.JurisdictionHabitualResidence;
    } else {
      nextStep = this.steps.PetitionerConfidential;
    }

    return {
      marriedInUk: {
        Yes: nextStep,
        No: this.steps.AboutYourMarriageCertificate
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
