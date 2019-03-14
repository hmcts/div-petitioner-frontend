const ExitStep = require('app/core/steps/ExitStep');

module.exports = class Timeout extends ExitStep {
  get url() {
    return '/timeout';
  }
};
