const Step = require('app/core/steps/Step');
const { authenticate } = require('app/services/idam');
const config = require('config');
const initSession = require('app/middleware/initSession');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const parseBool = require('app/core/utils/parseBool');

module.exports = class Index extends Step {
  get url() {
    return '/index';
  }

  get nextStep() {
    return this.steps.ScreeningQuestionsMarriageBroken;
  }

  get middleware() {
    const idamAuthenticate = (req, res, next) => {
      const auth = authenticate(req.protocol, req.get('host'), '/authenticated');
      return parseBool(config.features.idam) ? auth(req, res, next) : next();
    };

    return [
      initSession,
      checkCookiesAllowed,
      idamAuthenticate
    ];
  }

  handler(req, res, next) {
    res.redirect(this.next().url);
    next();
  }
};
