const DestroySessionStep = require('app/core/DestroySessionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const draftPetitionStoreMiddleware = require('app/middleware/draftPetitionStoreMiddleware');

module.exports = class ExitRemovedSavedApplication extends DestroySessionStep {
  get middleware() {
    return [draftPetitionStoreMiddleware.removeFromDraftStore];
  }
  handler(req, res) {
    return runStepHandler(this, req, res);
  }
  get url() {
    return '/exit/removed-saved-application';
  }
};
