const ValidationStep = require('app/core/steps/ValidationStep');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');

const BASE_PATH = '/';

module.exports = class AwaitingAmend extends ValidationStep {
  get url() {
    return '/awaiting-amend/amend-case';
  }

  get middleware() {
    return [
      idamProtect,
      checkCookiesAllowed,
      initSession,
      sessionTimeout,
      setIdamUserDetails
    ];
  }

  get postMiddleware() {
    return [];
  }

  * postRequest(req, res) {
    const { body } = req;
    const hasBeenPostedWithoutSubmitButton = body && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      return yield super.postRequest(req, res);
    }

    const { session } = req;
    const ctx = yield this.parseCtx(req);

    //  then test whether the request is valid
    const [isValid] = this.validate(ctx, session);

    if (isValid) {
      // apply ctx to session (this adds confirmPrayer to session before submission)
      req.session = this.applyCtxToSession(ctx, session);
      // if application is valid submit it
      return this.submitApplication(req, res);
    }

    return yield super.postRequest(req, res);
  }

  submitApplication(req, res) {
    if (req.session.submissionStarted) {
      return res.redirect(this.steps.ApplicationSubmitted.url);
    }
    req.session.state = 'amendCase';
    return res.redirect(BASE_PATH);
  }
};
