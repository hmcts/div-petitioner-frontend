const Step = require('app/core/steps/Step');
const idam = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const initSession = require('app/middleware/initSession');

const idamLandingPage = (req, res, next) => {
  if (features.idam) {
    const landing = idam.landingPage();
    return landing(req, res, () => {
      const { session } = req;

      // if the previous session has expired
      // after user logged in then destroy it
      if (session.expires <= Date.now()) {
        req.session.destroy(() => {
          next();
        });
      } else {
        next();
      }
    });
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
      idamLandingPage
    ];
  }

  handler(req, res, next) {
    res.redirect(this.next().url);
    next();
  }
};
