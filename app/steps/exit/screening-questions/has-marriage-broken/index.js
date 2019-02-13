const Step = require('app/core/steps/Step');

module.exports = class ExitMarriageBroken extends Step {
  get url() {
    return '/exit/screening-questions/marriage-broken';
  }
};
