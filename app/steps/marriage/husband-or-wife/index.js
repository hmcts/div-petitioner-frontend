const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class MarriageHusbandOrWife extends ValidationStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
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
