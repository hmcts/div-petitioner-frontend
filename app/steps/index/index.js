const Step = require('app/core/steps/Step');
const { authenticate } = require('app/services/idam');
const initSession = require('app/middleware/initSession');

module.exports = class Index extends Step {
  get url() {
    return '/index';
  }

  get nextStep() {
    return this.steps.ScreeningQuestionsLanguagePreference;
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
    res.redirect(this.next().url);
    next();
  }
};
