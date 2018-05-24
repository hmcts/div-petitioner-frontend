const ValidationStep = require('app/core/steps/ValidationStep');
const evidenceManagmentMiddleware = require('app/middleware/evidenceManagmentMiddleware');
const courtsAllocation = require('app/services/courtsAllocation');
const CONF = require('config');
const ga = require('app/services/ga');

module.exports = class UploadMarriageCertificate extends ValidationStep {
  get url() {
    return '/petitioner-respondent/marriage-certificate-upload';
  }

  next() {
    return this.steps.CheckYourAnswers;
  }

  get middleware() {
    return [
      ...super.middleware,
      evidenceManagmentMiddleware.createHandler('marriageCertificateFiles')
    ];
  }

  interceptor(ctx, session) {
    // Load courts data into session and select court automatically.
    if (!session.courts) {
      session.court = CONF.commonProps.court;
      session.courts = courtsAllocation.allocateCourt();
      ga.trackEvent('Court_Allocation', 'Allocated_court', session.courts, 1);
    }
    return ctx;
  }
};
