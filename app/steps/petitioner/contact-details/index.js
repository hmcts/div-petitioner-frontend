const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class PetitionerContactDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/contact-details';
  }
  get nextStep() {
    return this.steps.PetitionerHomeAddress;
  }

  validate(ctx, session) {
    if (session.req && !session.req.body.petitionerConsent) {
      delete session.petitionerConsent;
      delete ctx.petitionerConsent;
    }

    const [isValid, errors] = super.validate(ctx, session);
    return [isValid, errors];
  }
};
