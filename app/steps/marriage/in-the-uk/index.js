const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class MarriedInUk extends ValidationStep {
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
};
