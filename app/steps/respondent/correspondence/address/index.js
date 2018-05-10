const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');

module.exports = class RespondentCorrespondenceAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

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
