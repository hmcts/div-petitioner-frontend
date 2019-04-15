const Step = require('app/core/steps/Step');
const idam = require('app/services/idam');
const CONF = require('config');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const initSession = require('app/middleware/initSession');
const parseBool = require('app/core/utils/parseBool');

const runNext = (req, res, next) => {
  const { session } = req;

  // if the previous session has expired
  // after user logged in then destroy it
  if (session.expires <= Date.now()) {
    req.session.regenerate(() => {
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
      checkCookiesAllowed,
      idamLandingPage,
      initSession
    ];
  }

  handler(req, res, next) {
    res.redirect(this.next().url);
    next();
  }
};
