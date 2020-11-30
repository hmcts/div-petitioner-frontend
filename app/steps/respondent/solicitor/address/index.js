const AddressLookupStep = require('app/components/AddressLookupStep');

module.exports = class RespondentSolicitorAddress extends AddressLookupStep {
  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'respondentSolicitorAddress';
  }

  get url() {
    return '/petitioner-respondent/solicitor/address';
  }
  get nextStep() {
    return this.steps.ReasonForDivorce;
  }
};
