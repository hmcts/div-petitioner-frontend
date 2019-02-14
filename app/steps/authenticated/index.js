const Step = require('app/core/steps/Step');
const idam = require('app/services/idam');
const CONF = require('config');
const initSession = require('app/middleware/initSession');
const parseBool = require('app/core/utils/parseBool');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');

const runNext = (req, res, next) => {
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
};

const idamLandingPage = (req, res, next) => {
  if (parseBool(CONF.features.idam)) {
    const landing = idam.landingPage();
    return landing(req, res, () => {
      runNext(req, res, next);
    });
  }

  return runNext(req, res, next);
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
      idamLandingPage,
      // Query string arguments are lost on redirect so restoreFromDraftStore middleware here to support
      // toNextUnansweredPage query string argument ( used for amend petition )
      restoreFromDraftStore,
      initSession
    ];
  }

  handler(req, res, next) {
    res.redirect(this.next().url);
    next();
  }
};
