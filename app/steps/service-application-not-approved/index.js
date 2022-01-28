const Step = require('app/core/steps/Step');
const config = require('config');
const { updateAppWithoutNoticeFeeMiddleware,
  updateEnforcementFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');
const { getDownloadableFiles, getCurrentContent } = require('app/core/utils/viewHelper');

const serviceApplicationFileTypeMap = {
  bailiff: 'generalOrder',
  deemed: 'deemedServiceRefused',
  dispensed: 'dispenseWithServiceRefused'
};

module.exports = class ServiceApplicationNotApproved extends Step {
  get url() {
    return '/service-application-not-approved';
  }

  get ignorePa11yWarnings() {
    return [
      // A11y thinks link to download document is empty href
      'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoHref',
      'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.Placeholder',
      'WCAG2AA.Principle1.Guideline1_3.1_3_1.H48.2'
    ];
  }

  get middleware() {
    return [
      idamProtect,
      initSession,
      sessionTimeout,
      updateAppWithoutNoticeFeeMiddleware,
      updateEnforcementFeeMiddleware
    ];
  }

  interceptor(ctx, session) {
    this.setDocumentInfo(session, ctx);
    this.setFeesInfo(ctx);
    return ctx;
  }

  setFeesInfo(ctx) {
    ctx.feeToResendApplication = this.getFeeToResendApplication();
    ctx.feeToEnforce = this.getEnforcementFee();
  }

  setDocumentInfo(session, ctx) {
    session.downloadableFiles = this.getDownloadableFiles(session);
    ctx.serviceName = this.getServiceName(session);
    ctx.refusalDocumentLabel = this.getRefusalDocumentLabel(session);
  }

  getDownloadableFiles(session) {
    return getDownloadableFiles(session);
  }

  getRefusalDocumentLabel(session) {
    const { files } = getCurrentContent(this, session);
    const { serviceApplicationType } = session;
    const serviceApplicationFile = serviceApplicationFileTypeMap[serviceApplicationType];
    return files[serviceApplicationFile];
  }

  getServiceName(session) {
    const { serviceApplicationLabel } = getCurrentContent(this, session);
    return serviceApplicationLabel[session.serviceApplicationType];
  }

  getFeeToResendApplication() {
    return config.commonProps.appWithoutNoticeFee.amount;
  }

  getEnforcementFee() {
    return config.commonProps.enforcementFee.amount;
  }
};
