const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class ForeignCertificate extends ValidationStep {
  get url() {
    return '/about-your-marriage/foreign-certificate';
  }

  get nextStep() {
    return this.steps.JurisdictionHabitualResidence;
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);

    watch('marriedInUk', (previousSession, session, remove) => {
      if (session.marriedInUk === 'Yes') {
        remove('countryName');
        remove('placeOfMarriage');
      }
    });
  }
};
