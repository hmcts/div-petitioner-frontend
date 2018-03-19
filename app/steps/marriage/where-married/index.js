const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class WhereMarried extends OptionStep {
  get url() {
    return '/about-your-marriage/country';
  }
  get nextStep() {
    const nextStep = this.steps.JurisdictionHabitualResidence;

    return {
      marriageWhereMarried: {
        england: nextStep,
        wales: nextStep,
        elsewhere: this.steps.ExitInTheUk
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }
};
