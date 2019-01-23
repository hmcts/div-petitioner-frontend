const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');
const config = require('config');
const parseBool = require('app/core/utils/parseBool');

module.exports = class RespondentConsent extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/separated-2-years/respondent-consent';
  }
  get nextStep() {
    if (parseBool(config.features.release510)) {
      return this.steps.SeparationDateNew;
    }
    return this.steps.SeparationDate;
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      remove('reasonForDivorceRespondentConsent');
    });
  }
};
