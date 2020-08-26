const Step = require('app/core/steps/Step');
const config = require('config');
const { toLower } = require('lodash');
const { createUris } = require('@hmcts/div-document-express-handler');
const { updateAppWithoutNoticeFeeMiddleware,
  updateEnforcementFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');

module.exports = class ServiceApplicationNotApproved extends Step {
  get url() {
    return '/service-application-not-approved';
  }

  get ignorePa11yWarnings() {
    return [
      // A11y thinks link to download document is empty href
      'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.NoHref',
      'WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.A.Placeholder'
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

  setDocumentInfo(session) {
    session.downloadableFiles = this.getDownloadableFiles(session);
    const { type, uri } = this.getServiceRefusalDocument(session);
    session.refusalDocument = type;
    session.refusalDocumentUrl = uri;
  }

  getDownloadableFiles(session) {
    const docConfig = {
      documentNamePath: config.document.documentNamePath,
      documentWhiteList: config.document.filesWhiteList
    };

    return createUris(session.d8, docConfig);
  }

  // getServiceApplicationTypeLabel(session) {
  //   return session.serviceApplicationType === 'deemed' ? '\'deemed service\'' : '\'dispensed with service\'';
  // }

  getServiceRefusalDocument({ downloadableFiles, serviceApplicationType }) {
    let refusalDocument = { type: '', uri: '' };

    downloadableFiles.forEach(document => {
      const applicationType = toLower(serviceApplicationType);
      const type = toLower(document.type);
      if (type.startsWith(applicationType)) {
        refusalDocument = document;
      }
    });
    return refusalDocument;
  }

  getFeeToResendApplication() {
    return config.commonProps.appWithoutNoticeFee.amount;
  }

  getEnforcementFee() {
    return config.commonProps.enforcementFee.amount;
  }
};
