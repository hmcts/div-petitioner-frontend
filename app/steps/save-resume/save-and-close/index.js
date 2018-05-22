const DestroySessionStep = require('app/core/steps/DestroySessionStep');

module.exports = class ExitApplicationSaved extends DestroySessionStep {
  get url() {
    return '/exit/application-saved';
  }
};
