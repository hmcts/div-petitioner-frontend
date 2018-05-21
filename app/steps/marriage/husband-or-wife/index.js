const ValidationStep = require('app/core/steps/ValidationStep');

module.exports = class MarriageHusbandOrWife extends ValidationStep {
  get url() {
    return '/about-your-marriage/details';
  }
  get nextStep() {
    return this.steps.MarriageDate;
  }

  parseRequest(req) {
    const ctx = super.parseRequest(req);
    if (req.method.toLowerCase() === 'post' && !ctx.marriageIsSameSexCouple) {
      ctx.marriageIsSameSexCouple = 'No';
    }
    return ctx;
  }
};
