const Step = require('app/core/steps/Step');
const { authenticate } = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const parseBool = require('../../core/utils/parseBool');
const CONF = require('config');

const redirectFeatureOn = parseBool(CONF.features.newAppCutoff);

module.exports = class Index extends Step {
  get url() {
    return '/index';
  }

  nextStep(redirectFeature = redirectFeatureOn) {
    if (redirectFeature) {
      return this.steps.CutOffLandingPage;
    }

    return this.steps.ScreeningQuestionsLanguagePreference;
  }

  next(ctx, session) {
    return this.nextStep(session);
  }

  get middleware() {
    const idamAuthenticate = (req, res, next) => {
      const auth = authenticate('https', req.get('host'), '/authenticated', req.session.language);
      return auth(req, res, next);
    };

    return [
      initSession,
      idamAuthenticate
    ];
  }

  handler(req, res, next) {
    res.redirect(this.next({}, req.session).url);
    next();
  }
};
