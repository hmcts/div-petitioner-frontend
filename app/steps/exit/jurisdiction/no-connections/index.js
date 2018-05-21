const Step = require('app/core/steps/Step');

module.exports = class ExitNoConnections extends Step {
  get url() {
    return '/exit/jurisdiction/no-cnnections';
  }
  get nextStep() {
    return null;
  }
};
