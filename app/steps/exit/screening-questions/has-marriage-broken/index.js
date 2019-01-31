const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitMarriageBroken extends ExitStep {
  get url() {
    return '/exit/screening-questions/marriage-broken';
  }
};
