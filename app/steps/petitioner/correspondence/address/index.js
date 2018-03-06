const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class PetitionerCorrespondenceAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  get url() {
    return '/petitioner-respondent/petitioner-correspondence-address';
  }
  get nextStep() {
    return this.steps.LiveTogether;
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'petitionerCorrespondenceAddress';

    watch('petitionerCorrespondenceUseHomeAddress', (previousSession, session, remove) => {
      if (session.petitionerCorrespondenceUseHomeAddress === 'No') {
        remove('petitionerCorrespondenceAddress');
      }
    });
  }
};
