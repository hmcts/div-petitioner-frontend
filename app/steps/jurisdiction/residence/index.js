const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { setConnections } = require('app/services/oJurisdiction/connections');

module.exports = class JurisdictionResidence extends ValidationStep {
  get url() {
    return '/jurisdiction/residence';
  }

  get nextStep() {
    return this.steps.JurisdictionDomicile;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  action(ctx, session) {
    session.jurisdictionPath = [this.name];
    setConnections(ctx, session, this);

    return [ctx, session];
  }
};
