const Step = require('app/core/Step');
const { authenticate } = require('app/services/idam');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const logger = require('@hmcts/nodejs-logging').Logger.getLogger(__filename);

module.exports = class Start extends Step {
  get url() {
    return '/start';
  }

  get nextStep() {
    return this.steps.ScreeningQuestionsMarriageBroken;
  }

  get middleware() {
    const idamAuthenticate = (req, res, next) => {
      logger.info(req.protocol);
      logger.info(req.headers);
      logger.info(req.get('host'));
      const auth = authenticate(req.protocol.concat('://', req.get('host'), '/authenticated'));
      return features.idam ? auth(req, res, next) : next();
    };
    return [checkCookiesAllowed, idamAuthenticate];
  }

  handler(req, res) {
    res.redirect(this.next().url);
  }
};
