const AddressLookupStep = require('app/components/AddressLookupStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class Adultery3rdPartyAddress extends AddressLookupStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'reasonForDivorceAdultery3rdAddress';

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdultery3rdAddress');
      }
    });
  }

  get url() {
    return '/about-divorce/reason-for-divorce/adultery/co-respondent-address';
  }
  get nextStep() {
    return this.steps.AdulteryWhere;
  }
};
