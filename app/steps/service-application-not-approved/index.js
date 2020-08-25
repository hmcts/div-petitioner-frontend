const Step = require('app/core/steps/Step');
const config = require('config');
const { toLower } = require('lodash');
const { createUris } = require('@hmcts/div-document-express-handler');
const { updateAppWithoutNoticeFeeMiddleware,
  updateEnforcementFeeMiddleware } = require('app/middleware/updateApplicationFeeMiddleware');
const initSession = require('app/middleware/initSession');
const sessionTimeout = require('app/middleware/sessionTimeout');
const { idamProtect } = require('app/middleware/idamProtectMiddleware');

const refusalFiles = {
  DeemedServiceRefused: 'Deemed service refusal',
  DispenseWithServiceRefused: 'Dispensed service refusal'
};

module.exports = class SaNotApproved extends Step {
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
    this.setGeneralInfo(ctx, session);
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
    const { type, uri } = this.getServiceRefusalDocument(session);
    ctx.refusalDocument = refusalFiles[type];
    ctx.refusalDocumentUrl = uri;
  }

  setGeneralInfo(ctx, session) {
    ctx.serviceApplicationTypeLabel = this.getServiceApplicationTypeLabel(session);
  }

  getDownloadableFiles(session) {
    const docConfig = {
      documentNamePath: config.document.documentNamePath,
      documentWhiteList: config.document.filesWhiteList
    };

    return createUris(session.d8, docConfig);
  }

  getServiceApplicationTypeLabel(session) {
    return session.serviceApplicationType === 'deemed' ? '\'deemed service\'' : '\'dispensed with service\'';
  }

  getServiceRefusalDocument(session) {
    let refusalDocument = { type: '', uri: '' };
    const documents = this.getDownloadableFiles(session);

    documents.forEach(document => {
      const serviceApplicationType = toLower(session.serviceApplicationType);
      const type = toLower(document.type);
      if (type.startsWith(serviceApplicationType)) {
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
