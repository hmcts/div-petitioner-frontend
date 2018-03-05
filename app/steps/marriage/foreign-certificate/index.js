const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class ForeignCertificate extends ValidationStep {
  get url() {
    return '/about-your-marriage/foreign-certificate';
  }

  get nextStep() {
    return this.steps.JurisdictionHabitualResidence;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
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
