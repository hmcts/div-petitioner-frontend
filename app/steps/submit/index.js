const logger = require('app/services/logger').logger(__filename);
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const Step = require('app/core/steps/Step');
const { features } = require('@hmcts/div-feature-toggle-client')().featureToggles;
const submissionService = require('app/services/submission');
const sessionBlacklistedAttributes = require('app/resources/sessionBlacklistedAttributes');
const courtsAllocation = require('app/services/courtsAllocation');
const CONF = require('config');
const ga = require('app/services/ga');

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

  handler(req, res, next) {
    if (req.session.submissionStarted) {
      res.redirect(this.steps.ApplicationSubmitted.url);
      return;
    }

    // Fail early if the request is not in the right format.
    const { method, cookies } = req;

    if (method.toLowerCase() !== 'get' || !cookies || !cookies['connect.sid']) {
      logger.error('Malformed request to Submit step', req);
      res.redirect(this.steps.Error404.url);
      next();
      return;
    }

    req.session = req.session || {};

    // Load courts data into session and select court automatically.
    req.session.court = CONF.commonProps.court;
    req.session.courts = courtsAllocation.allocateCourt();
    ga.trackEvent('Court_Allocation', 'Allocated_court', req.session.courts, 1);

    // Get user token.
    let authToken = '';
    if (features.idam) {
      authToken = req.cookies['__auth-token'];
    }

    // We blacklist a few session keys which are internal to the application and
    // are not needed for the submission.
    const payload = sessionBlacklistedAttributes.reduce((acc, item) => {
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
        next();
      })
      .catch(error => {
        delete req.session.submissionStarted;
        logger.error({
          message: 'Error during submission step:',
          error
        });
        res.redirect('/generic-error');
      });
  }

  get nextStep() {
    return {
      helpWithFeesNeedHelp: {
        Yes: this.steps.DoneAndSubmitted,
        No: this.steps.PayOnline
      }
    };
  }

  next(ctx, session) {
    return this.nextStep.helpWithFeesNeedHelp[session.helpWithFeesNeedHelp];
  }

  get url() {
    return '/submit';
  }
};
