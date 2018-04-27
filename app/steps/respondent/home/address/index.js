const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class RespondentHomeAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'respondentHomeAddress';

    watch('respondentKnowsHomeAddress', (previousSession, session, remove) => {
      const respondentHomeAddressIsNotKnown = !session.respondentKnowsHomeAddress || session.respondentKnowsHomeAddress === 'No';
      const notLivingTogether = session.livingArrangementsLiveTogether === 'No';

      if (respondentHomeAddressIsNotKnown && notLivingTogether) {
        remove('respondentHomeAddress');
      }
    });
  }

  get url() {
    return '/petitioner-respondent/home-address';
  }
  get nextStep() {
    return this.steps.RespondentCorrespondenceUseHomeAddress;
  }
};
