const ExitStep = require('app/core/steps/ExitStep');

module.exports = class ExitApplicationSaved extends ExitStep {
  get url() {
    return '/exit/application-saved';
  }
};
