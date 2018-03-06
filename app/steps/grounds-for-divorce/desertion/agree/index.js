const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class DesertionAgree extends OptionStep {
  get url() {
    return '/about-divorce/reason-for-divorce/desertion/agree';
  }
  get nextStep() {
    return {
      reasonForDivorceDesertionAgreed: {
        Yes: this.steps.DesertionDetails,
        No: this.steps.ExitDesertionAgree
      }
    };
  }
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove('reasonForDivorceDesertionAgreed');
    });
  }
};
