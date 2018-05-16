const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class PetitionerCorrespondence extends ValidationStep {
  get url() {
    return '/petitioner-respondent/petitioner-correspondence/use-home-address';
  }
  get nextStep() {
    return {
      petitionerCorrespondenceUseHomeAddress: {
        Yes: this.steps.LiveTogether,
        No: this.steps.PetitionerCorrespondenceAddress
      }
    };
  }

  constructor(...args) {
    super(...args);

    watch('petitionerHomeAddress', (previousSession, session, remove) => {
      if (session.petitionerCorrespondenceUseHomeAddress === 'Yes') {
        remove('petitionerCorrespondenceUseHomeAddress', 'petitionerCorrespondenceAddress');
      }
    });
  }

  action(ctx, session) {
    if (ctx.petitionerCorrespondenceUseHomeAddress === 'Yes') {
      ctx.petitionerCorrespondenceAddress = session.petitionerHomeAddress;
    }

    return [ctx, session];
  }
};
