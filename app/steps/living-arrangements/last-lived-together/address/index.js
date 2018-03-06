const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class LastLivedTogetherAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'livingArrangementsLastLivedTogetherAddress';

    watch('livingArrangementsLastLivedTogether', (previousSession, session, remove) => {
      if (session.livingArrangementsLastLivedTogether !== 'Yes') {
        remove('livingArrangementsLastLivedTogetherAddress');
      }
    });
  }

  get url() {
    return '/petitioner-respondent/last-lived-together-address';
  }
  get nextStep() {
    return this.steps.RespondentLivesAtLastAddress;
  }
};
