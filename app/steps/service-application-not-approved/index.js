const Step = require('app/core/steps/Step');
const config = require('config');
const { createUris } = require('@hmcts/div-document-express-handler');
const { updateAppWithoutNoticeFeeMiddleware,
  updateEnforcementFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');

const serviceApplicationFileTypeMap = {
  deemed: 'DeemedServiceRefused',
  dispensed: 'DispenseWithServiceRefused'
};

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
    const { downloadableFiles, serviceApplicationType } = session;
    const serviceApplicationFile = serviceApplicationFileTypeMap[serviceApplicationType];
    const document = { fileLabel: '', fileUri: '' };

    downloadableFiles
      .filter(file => {
        return file.type === serviceApplicationFile;
      })
      .map(file => {
        document.fileUri = file.uri;
        document.fileLabel = this.getRefusalDocumentLabel(session, serviceApplicationFile);
        return file;
      });
    return document;
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
