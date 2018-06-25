const Step = require('app/core/steps/Step');
const { authenticate } = require('app/services/idam');
const CONF = require('config');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');

module.exports = class Start extends Step {
  get url() {
    return '/start';
  }

  get nextStep() {
    return this.steps.ScreeningQuestionsMarriageBroken;
  }

  get middleware() {
    const idamAuthenticate = (req, res, next) => {
      const auth = authenticate(req.protocol, req.get('host'), '/authenticated');
      return CONF.features.idam ? auth(req, res, next) : next();
    };
    return [checkCookiesAllowed, idamAuthenticate];
  }

  handler(req, res, next) {
    res.redirect(this.next().url);
    next();
  }
};
