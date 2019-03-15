const ExitStep = require('app/core/steps/ExitStep');
const draftPetitionStoreMiddleware = require('app/middleware/draftPetitionStoreMiddleware');

module.exports = class ExitRemovedSavedApplication extends ExitStep {
  get middleware() {
    return [draftPetitionStoreMiddleware.removeFromDraftStore];
  }
  get url() {
    return '/exit/removed-saved-application';
  }
};
