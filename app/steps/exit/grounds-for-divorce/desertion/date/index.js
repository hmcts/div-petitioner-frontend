const Step = require('app/core/steps/Step');

module.exports = class ExitDesertionDate extends Step {
  get url() {
    return '/exit/desertion/when';
  }
  get nextStep() {
    return null;
  }
};
