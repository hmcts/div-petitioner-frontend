const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class MarriedInUk extends OptionStep {
  get url() {
    return '/about-your-marriage/in-the-uk';
  }

  get nextStep() {
    return {
      marriedInUk: {
        Yes: this.steps.JurisdictionHabitualResidence,
        No: this.steps.AboutYourMarriageCertificate
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
