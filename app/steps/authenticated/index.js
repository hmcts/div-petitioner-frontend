const Step = require('app/core/Step');
const idam = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');

const idamLandingPage = (req, res, next) => {
  if (features.idam) {
    const landing = idam.landingPage();
    return landing(req, res, next);
  }

  return next();
};

module.exports = class Authenticated extends Step {
  get url() {
    return '/authenticated';
  }

  get nextStep() {
    return this.steps.ScreeningQuestionsMarriageBroken;
  }

  get middleware() {
    return [
      initSession,
      sessionTimeout,
      idamLandingPage
    ];
  }

  handler(req, res) {
    res.redirect(this.next().url);
  }
};
