const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class RespondentSolicitorAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

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
