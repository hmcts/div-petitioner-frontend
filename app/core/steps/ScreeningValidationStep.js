const ValidationStep = require('./ValidationStep');

const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { redirectOnCondition } = require('app/middleware/redirectMiddleware');
const { hasSubmitted } = require('app/middleware/submissionMiddleware');
const { restoreFromDraftStore } = require('app/middleware/draftPetitionStoreMiddleware');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { setIdamUserDetails } = require('app/middleware/setIdamDetailsToSessionMiddleware');
const _ = require('lodash');
const CONF = require('config');

const logger = require('app/services/logger').logger(__filename);

module.exports = class ScreeningValidationStep extends ValidationStep {
  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      redirectOnCondition,
      restoreFromDraftStore,
      setIdamUserDetails,
      hasSubmitted
    ];
  }

  get postMiddleware() {
    const redirectLandingPage = (req, res, next) => {
      logger.infoWithReq(req, 'Redirecting from Screening Validation');
      const session = req.session;
      const caseState = _.get(session, 'state');
      const caseId = _.get(session, 'caseId');
      logger.infoWithReq(req, caseId);
      const redirectionStates = CONF.newAppCutoffRedirectStates;
      logger.infoWithReq(req, `Screening Validation Redirection States: ${redirectionStates}`);
      const redirect = redirectionStates.includes(caseState) || !caseState;
      logger.infoWithReq(req, `Screening Validation Redirect: ${redirect}`);
      const toggle = JSON.parse(CONF.features.newAppCutoff);
      logger.infoWithReq(req, `Screening Validation Toggle: ${toggle}`);
      // eslint-disable-next-line no-undefined
      logger.infoWithReq(req, `Screening Validation TypeOf CaseId: ${typeof caseId === undefined}`);
      if (toggle && redirect) {
        logger.infoWithReq(req, 'PFE redirecting to Landing Page', `Case Ref: ${caseId}. Redirect check Passed.`);
        return res.redirect('/cutoff-landing-page');
      }

      return next();
    };
    return [redirectLandingPage];
  }
};
