const AddressLookupStep = require('app/components/AddressLookupStep');

module.exports = class RespondentCorrespondenceAddress extends AddressLookupStep {
  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'respondentCorrespondenceAddress';
  }

  get url() {
    return '/petitioner-respondent/respondent-correspondence-address';
  }
  get nextStep() {
    return this.steps.ReasonForDivorce;
  }
};
