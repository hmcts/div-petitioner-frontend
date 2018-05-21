const AddressLookupStep = require('app/components/AddressLookupStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class Adultery3rdPartyAddress extends AddressLookupStep {
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
