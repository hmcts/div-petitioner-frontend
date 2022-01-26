const AddressLookupStep = require('app/components/AddressLookupStep');
const { watch } = require('app/core/helpers/staleDataManager');
const logging = require('@hmcts/nodejs-logging');

module.exports = class RespondentHomeAddress extends AddressLookupStep {
  constructor(steps, section, templatePath, content, schema) {
    super(steps, section, templatePath, content, schema);
    this.schemaScope = 'respondentHomeAddress';

    watch('respondentKnowsHomeAddress', (previousSession, session, remove) => {
      const respondentHomeAddressIsNotKnown = (!session.respondentKnowsHomeAddress || session.respondentKnowsHomeAddress === 'No');
      const loggerInstance = logging.Logger.getLogger('name');
      const notLivingTogether = session.livingArrangementsLiveTogether === 'No';
      if (respondentHomeAddressIsNotKnown && notLivingTogether) {
        loggerInstance.info('MEEEEEE respondentHomeAddress removed');
        remove('respondentHomeAddress');
      }
    });

    watch('respondentLivesAtLastAddress', (previousSession, session, remove) => {
      const loggerInstance = logging.Logger.getLogger('name');
      if (session.respondentContactDetailsConfidential === 'keep') {
        loggerInstance.info('MEEEEEE watch respondentLivesAtLastAddress should remove');
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
