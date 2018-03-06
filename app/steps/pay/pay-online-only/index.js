const Step = require('app/core/Step');
const runStepHandler = require('app/core/handler/runStepHandler');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;

module.exports = class PayOnline extends Step {
  get url() {
    return '/pay/online';
  }

  get nextStep() {
    return features.onlineSubmission ? this.steps.PayByCard : this.steps.PayHow;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }

  action(ctx, session) {
    session.paymentMethod = 'card-online';
    return [ctx, session];
  }
};
