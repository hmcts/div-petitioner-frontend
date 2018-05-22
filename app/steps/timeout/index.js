const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class Timeout extends DestroySessionStep {
  get url() {
    return '/timeout';
  }
};
