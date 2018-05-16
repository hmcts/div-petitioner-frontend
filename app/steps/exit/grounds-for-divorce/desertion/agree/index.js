const Step = require('app/core/steps/Step');

module.exports = class ExitDesertionAgree extends Step {
  get url() {
    return '/exit/desertion/agree';
  }
  get nextStep() {
    return null;
  }
};
