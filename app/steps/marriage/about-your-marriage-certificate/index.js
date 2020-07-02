const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class AboutYourMarriageCertificate extends ValidationStep {
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

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('marriedInUk', (previousSession, session, remove) => {
      if (session.marriedInUk === 'Yes') {
        remove('certificateInEnglish');
        remove('certifiedTranslation');

        session.petitionerPcqId = '2e23d0fa-6b24-47cb-b402-2a7837821d41';
      }
    });

    watch('certificateInEnglish', (previousSession, session, remove) => {
      if (session.certificateInEnglish === 'Yes') {
        remove('certifiedTranslation');
      }
    });
  }
};
