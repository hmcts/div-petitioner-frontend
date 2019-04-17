const ValidationStep = require('app/core/steps/ValidationStep');
const capitalizeName = require('app/core/utils/capitalizeName');

module.exports = class MarriageNames extends ValidationStep {
  get url() {
    return '/petitioner-respondent/names';
  }
  get nextStep() {
    return this.steps.MarriageCertificateNames;
  }

  action(ctx, session) {
    ctx.petitionerFirstName = capitalizeName(ctx.petitionerFirstName);
    ctx.petitionerLastName = capitalizeName(ctx.petitionerLastName);
    ctx.respondentFirstName = capitalizeName(ctx.respondentFirstName);
    ctx.respondentLastName = capitalizeName(ctx.respondentLastName);
    return [ctx, session];
  }
};
