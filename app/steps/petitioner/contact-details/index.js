const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class PetitionerContactDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/contact-details';
  }

  get nextStep() {
    return this.steps.PetitionerHomeAddress;
  }

  parseRequest(req) {
    const ctx = super.parseRequest(req);

    if (!ctx.petitionerConsent) {
      ctx.petitionerConsent = undefined; // eslint-disable-line no-undefined
    }

    return ctx;
  }
};
