const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class AboutYourMarriageCertificate extends OptionStep {
  get url() {
    return '/about-your-marriage/about-your-marriage-certificate';
  }

  get nextStep() {
    return {
      certificateInEnglish: {
        Yes: this.steps.ForeignCertificate,
        No: {
          certifiedTranslation: {
            Yes: this.steps.ForeignCertificate,
            No: this.steps.ExitNoCertificateTranslated
          }
        }
      }
    };
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('marriedInUk', (previousSession, session, remove) => {
      if (session.marriedInUk === 'Yes') {
        remove('certificateInEnglish');
        remove('certifiedTranslation');
      }
    });

    watch('certificateInEnglish', (previousSession, session, remove) => {
      if (session.certificateInEnglish === 'Yes') {
        remove('certifiedTranslation');
      }
    });
  }
};
