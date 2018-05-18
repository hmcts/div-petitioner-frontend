const Step = require('app/core/steps/Step');

module.exports = class ExitJurisdiction extends Step {
  get url() {
    return '/exit/jurisdiction/last-resort';
  }
  get nextStep() {
    return null;
  }
};
