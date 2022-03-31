const ValidationStep = require('./ValidationStep');

const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { redirectOnCondition } = require('app/middleware/redirectMiddleware');
const { redirectToLandingPageOnCondition } = require('app/middleware/redirectLandingPage');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');

module.exports = class ScreeningValidationStep extends ValidationStep {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      redirectOnCondition,
      redirectToLandingPageOnCondition,
      restoreFromDraftStore,
      setIdamUserDetails,
      hasSubmitted
    ];
  }

  get postMiddleware() {
    return [];
  }
};