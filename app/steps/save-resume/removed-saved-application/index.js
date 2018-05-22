const DestroySessionStep = require('app/core/steps/DestroySessionStep');
const draftPetitionStoreMiddleware = require('app/middleware/draftPetitionStoreMiddleware');

module.exports = class ExitRemovedSavedApplication extends DestroySessionStep {
  get middleware() {
    return [draftPetitionStoreMiddleware.removeFromDraftStore];
  }
  get url() {
    return '/exit/removed-saved-application';
  }
};
