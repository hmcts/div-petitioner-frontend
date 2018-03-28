const statusCodes = require('http-status-codes');
const logger = require('@hmcts/nodejs-logging').getLogger(__filename);
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const Step = require('app/core/Step');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const submissionService = require('app/services/submission');

module.exports = class Submit extends Step {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      restoreFromDraftStore,
      setIdamUserDetails
    ];
  }

  handler(req, res) {
    // This step does not exist if online submission is not enabled.
    if (!features.onlineSubmission) {
      logger.error('Tried to access Submit step when online submission is turned off');
      const step = this.steps.Error404;
      const content = step.generateContent();
      res.status(statusCodes.NOT_FOUND)
        .render(step.template, { content });
      return;
    }

    if (req.session.submissionStarted) {
      res.redirect(this.steps.ApplicationSubmitted.url);
      return;
    }

    // Fail early if the request is not in the right format.
    const { method, cookies } = req;

    if (method.toLowerCase() !== 'get' || !cookies || !cookies['connect.sid']) {
      logger.error('Malformed request to Submit step');
      const step = this.steps.Error400;
      const content = step.generateContent();
      res.status(statusCodes.BAD_REQUEST)
        .render(step.template, { content });
      return;
    }

    req.session = req.session || {};

    // Get user token.
    let authToken = '';
    if (features.idam) {
      authToken = req.cookies['__auth-token'];
    }

    // We blacklist a few session keys which are internal to the application and
    // are not needed for the submission.
    const blacklistedProperties = [
      'cookie',
      'expires',
      'stepTemplates',
      'currentPaymentId',
      'payments',
      'caseId'
    ];
    const payload = blacklistedProperties.reduce((acc, item) => {
      delete acc[item];
      return acc;
    }, Object.assign({}, req.session));
    const submission = submissionService.setup();

    req.session.submissionStarted = true;
    submission.submit(authToken, payload)
      .then(response => {
        // Check for errors.
        if (response && response.error) {
          throw Object.assign({}, { message: `Error in transformation response, ${JSON.stringify(response)}` });
        }
        if (response && !response.caseId) {
          throw Object.assign({}, { message: `Case ID missing in transformation response, ${JSON.stringify(response)}` });
        }
        delete req.session.submissionStarted;
        // Store the resulting case identifier in session for later use.
        req.session.caseId = response.caseId;
        res.redirect(this.next(null, req.session).url);
      })
      .catch(error => {
        delete req.session.submissionStarted;
        logger.error(`Error during submission step: ${error}`);
        res.redirect('/generic-error');
      });
  }

  next(ctx, session) {
    if (session.helpWithFeesNeedHelp === 'Yes') {
      return this.steps.DoneAndSubmitted;
    }
    return this.steps.PayOnline;
  }

  get url() {
    return '/submit';
  }
};
