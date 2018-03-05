const OptionStep = require('app/core/OptionStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class PetitionerCorrespondence extends OptionStep {
  handler(req, res) {
    return runStepHandler(this, req, res);
  }

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
