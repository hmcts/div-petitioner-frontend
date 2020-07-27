const ValidationStep = require('app/core/steps/ValidationStep');
const evidenceManagmentMiddleware = require('app/middleware/evidenceManagmentMiddleware');

module.exports = class UploadMarriageCertificate extends ValidationStep {
  get url() {
    return '/petitioner-respondent/marriage-certificate-upload';
  }

  get nextStep() {
    return this.steps.Equality;
  }

  get middleware() {
    return [
      ...super.middleware,
      evidenceManagmentMiddleware.createHandler('marriageCertificateFiles')
    ];
  }
};
