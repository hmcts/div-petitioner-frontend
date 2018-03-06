const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class PayHow extends OptionStep {
  get enabledAfterSubmission() {
    return true;
  }

  get url() {
    return '/pay/how';
  }

  get nextStep() {
    return {
      paymentMethod: {
        cheque: this.steps.CheckYourAnswers,
        'card-phone-court': this.steps.PayByPhoneCourt
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('helpWithFeesNeedHelp', (previousSession, session, remove) => {
      if (session.helpWithFeesNeedHelp === 'Yes') {
        remove('paymentMethod');
      }
    });
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
