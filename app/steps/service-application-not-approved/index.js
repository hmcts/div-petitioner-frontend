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

  setDocumentInfo(session, ctx) {
    session.downloadableFiles = this.getDownloadableFiles(session);
    ctx.serviceName = this.getServiceName(session);
    const { fileLabel, fileUri } = this.getServiceRefusalDocument(session);
    ctx.refusalDocument = fileLabel;
    ctx.refusalDocumentUri = fileUri;
  }

  getDownloadableFiles(session) {
    const docConfig = {
      documentNamePath: config.document.documentNamePath,
      documentWhiteList: config.document.filesWhiteList
    };

    return createUris(session.d8, docConfig);
  }

  getServiceRefusalDocument(session) {
    const { serviceApplicationLabel } = this.getCurrentContent(session);
    const { downloadableFiles, serviceApplicationType } = session;
    const refusalDocument = { fileLabel: '', fileUri: '' };

    downloadableFiles.forEach(document => {
      const applicationType = toLower(serviceApplicationType);
      if (serviceApplicationLabel[applicationType]) {
        refusalDocument.fileUri = document.uri;
        refusalDocument.fileLabel = this.getRefusalDocumentLabel(session, document.type);
      }
    });
    return refusalDocument;
  }

  getRefusalDocumentLabel(session, type) {
    const { files } = this.getCurrentContent(session);
    return files[type];
  }

  getServiceName(session) {
    const { serviceApplicationLabel } = this.getCurrentContent(session);
    return serviceApplicationLabel[session.serviceApplicationType];
  }

  getFeeToResendApplication() {
    return config.commonProps.appWithoutNoticeFee.amount;
  }

  getEnforcementFee() {
    return config.commonProps.enforcementFee.amount;
  }

  getCurrentContent(session) {
    return this.content.resources[session.language].translation.content;
  }
};
