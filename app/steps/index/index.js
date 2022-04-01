const Step = require('app/core/steps/Step');
const { authenticate } = require('app/services/idam');
const initSession = require('app/middleware/initSession');
const logger = require('app/services/logger').logger(__filename);

module.exports = class Index extends Step {
  get url() {
    return '/index';
  }

  nextStep() {
    return this.steps.ScreeningQuestionsLanguagePreference;
  }

  next(ctx, session) {
    logger.infoWithReq(null, `Index Next Step: ${session} `);
    return this.nextStep(session);
  }

  get middleware() {
    logger.infoWithReq(null, 'Index get middleware');
    const idamAuthenticate = (req, res, next) => {
      logger.infoWithReq(req, 'idamAuthenticate');
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
