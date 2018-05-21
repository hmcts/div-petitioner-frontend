const AddressLookupStep = require('app/components/AddressLookupStep');

module.exports = class PetitionerHomeAddress extends AddressLookupStep {
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
