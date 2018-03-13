const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class AdulteryWhere extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/where';
  }

  get nextStep() {
    return this.steps.AdulteryWhen;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorceAdulteryWishToName', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryWishToName !== 'Yes') {
        remove('reasonForDivorceAdulteryKnowWhere');
      }
    });

    watch('reasonForDivorceAdulteryKnowWhere', (previousSession, session, remove) => {
      if (previousSession.reasonForDivorceAdulteryKnowWhere === 'No') {
        remove('reasonForDivorceAdulteryWhereDetails');
      }
    });
  }

  action(ctx, session) {
    if (ctx.reasonForDivorceAdulteryKnowWhere === 'No') {
      session.reasonForDivorceAdulteryWhereDetails = 'The applicant does not know where the adultery took place';
    }

    return [ctx, session];
  }

  // disable check your answers
  get checkYourAnswersTemplate() {
    return false;
  }
};
