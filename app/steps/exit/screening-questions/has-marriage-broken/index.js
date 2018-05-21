const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class ExitMarriageBroken extends DestroySessionStep {
  get url() {
    return '/exit/screening-questions/marriage-broken';
  }
};
