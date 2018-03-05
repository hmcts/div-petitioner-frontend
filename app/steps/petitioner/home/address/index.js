const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class PetitionerHomeAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'petitionerHomeAddress';
  }

  get url() {
    return '/petitioner-respondent/address';
  }
  get nextStep() {
    return this.steps.PetitionerCorrespondence;
  }
};
