const Step = require('app/core/steps/Step');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const checkCookiesAllowed = require('app/middleware/checkCookiesAllowed');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const logger = require('app/services/logger').logger(__filename);
const submissionService = require('app/services/submission');
const { getDownloadableFiles } = require('app/core/utils/viewContent');

const BASE_PATH = '/';

module.exports = class AwaitingAmend extends Step {
  get url() {
    return '/amendment-explanatory-page';
  }

  get nextStep() {
    return this.steps.Index;
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

  interceptor(ctx, session) {
    session.downloadableFiles = this.getDownloadableFiles(session);
    return ctx;
  }

  getDownloadableFiles(session) {
    return getDownloadableFiles(session);
  }

  postRequest(req, res) {
    const { body } = req;
    const hasBeenPostedWithoutSubmitButton = body && !body.hasOwnProperty('submit');

    if (hasBeenPostedWithoutSubmitButton) {
      return res.redirect(BASE_PATH);
    }

    logger.infoWithReq(req, 'status_amend', 'Request for amending case', req.session.caseId);
    return this.submitApplication(req, res);
  }

  submitApplication(req, res) {
    const authToken = req.cookies['__auth-token'];
    const submission = submissionService.setup();

    return submission.amend(req, authToken, req.session.caseId)
      .then(response => {
        const { previousCaseId, caseReference } = response;
        logger.infoWithReq(req, 'amendment_success', 'Case amended successfully', { previousCaseId, caseReference });

        const retainedProps = this.getRetainedSessionProperties(req);

        req.session.regenerate(() => {
          Object.assign(req.session, response, retainedProps, { state: null, reasonsForDivorceShowAll: true });
          res.redirect(this.nextStep.url);
        });
      })
      .catch(error => {
        logger.errorWithReq(req, 'amendment_error', 'Error during amendment step', error.message);
        res.redirect('/generic-error');
      });
  }

  getRetainedSessionProperties(req) {
    return {
      cookie: req.session.cookie,
      csrfSecret: req.session.csrfSecret,
      featureToggles: req.session.featureToggles,
      fetchedDraft: req.session.fetchedDraft,
      expires: req.session.expires
    };
  }
};
