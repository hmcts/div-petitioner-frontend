const ValidationStep = require('app/core/steps/ValidationStep');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');

const BASE_PATH = '/';

module.exports = class AwaitingAmend extends ValidationStep {
  get url() {
    return '/awaiting-amend-case';
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
      return res.redirect(BASE_PATH);
    }

    const ctx = yield this.parseCtx(req);
    const [isValid] = this.validate(ctx, req.session);

    if (isValid) {
      req.session = this.applyCtxToSession(ctx, req.session);
      return this.submitApplication(req, res);
    }
    return yield super.postRequest(req, res);
  }

  submitApplication(req, res) {
    req.session.state = 'amendCase';
    return res.redirect(BASE_PATH);
  }
};
