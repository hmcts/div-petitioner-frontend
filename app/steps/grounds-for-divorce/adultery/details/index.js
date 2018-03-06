const ValidationStep = require('app/core/ValidationStep');
const runStepHandler = require('app/core/handler/runStepHandler');
const { watch } = require('app/core/staleDataManager');

module.exports = class AdulteryDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/details';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
  }

  handler(req, res) {
    return runStepHandler(this, req, res);
  }

  constructor(...args) {
    super(...args);

    watch('reasonForDivorce', (previousSession, session, remove) => {
      if (session.reasonForDivorce !== 'adultery') {
        remove(
          'reasonForDivorceAdulteryDetails',
          'reasonForDivorceAdulteryWhenDetails',
          'reasonForDivorceAdulteryWhereDetails'
        );
      }
    });

    watch('reasonForDivorceAdulteryKnowWhen', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryKnowWhen !== 'Yes') {
        remove('reasonForDivorceAdulteryWhenDetails');
      }
    });

    watch('reasonForDivorceAdulteryKnowWhere', (previousSession, session, remove) => {
      if (session.reasonForDivorceAdulteryKnowWhere !== 'Yes') {
        remove('reasonForDivorceAdulteryWhereDetails');
      }
    });
  }

  * validate(ctx, session) {
    const [isValid, errors] = yield super.validate(ctx, session);

    const sortErrors = unsortedErrors => {
      // ensure the errors are ordered correctly on the screen
      const orderOrErrors = [
        'reasonForDivorceAdulteryWhenDetails',
        'reasonForDivorceAdulteryWhereDetails',
        'reasonForDivorceAdulteryDetails'
      ];

      return unsortedErrors.sort((a, b) => {
        return orderOrErrors.indexOf(a.param) - orderOrErrors.indexOf(b.param);
      });
    };

    const removeUnWantedErrors = errorsList => {
      // create array of unwanted errors depending on what details the user is required to fill out
      const unwantedErrors = ['reasonForDivorceAdulteryKnowWhen', 'reasonForDivorceAdulteryKnowWhere'];

      if (!ctx.reasonForDivorceAdulteryKnowWhen || ctx.reasonForDivorceAdulteryKnowWhen === 'No') {
        unwantedErrors.push('reasonForDivorceAdulteryWhenDetails');
      }

      if (!ctx.reasonForDivorceAdulteryKnowWhere || ctx.reasonForDivorceAdulteryKnowWhere === 'No') {
        unwantedErrors.push('reasonForDivorceAdulteryWhereDetails');
      }

      return errorsList.filter(error => {
        return !unwantedErrors.includes(error.param);
      });
    };

    if (!isValid) {
      return [
        isValid, yield Promise.resolve(errors).then(removeUnWantedErrors)
          .then(sortErrors)
      ];
    }

    return [isValid, errors];
  }
};
