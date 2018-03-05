const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class PetitionerContactDetails extends ValidationStep {
  get url() {
    return '/petitioner-respondent/contact-details';
  }
  get nextStep() {
    return this.steps.PetitionerHomeAddress;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  * validate(ctx, session) {
    if (session.req && !session.req.body.petitionerConsent) {
      delete session.petitionerConsent;
      delete ctx.petitionerConsent;
    }

    const [isValid, errors] = yield super.validate(ctx, session);
    return [isValid, errors];
  }
};
