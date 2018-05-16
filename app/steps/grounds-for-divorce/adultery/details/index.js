const ValidationStep = require('app/core/steps/ValidationStep');
const { watch } = require('app/core/helpers/staleDataManager');

module.exports = class AdulteryDetails extends ValidationStep {
  get url() {
    return '/about-divorce/reason-for-divorce/adultery/details';
  }

  get nextStep() {
    return this.steps.LegalProceedings;
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
  }

  validate(ctx, session) {
    const [isValid, errors] = super.validate(ctx, session);

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
      const errorsList = removeUnWantedErrors(errors);
      const sortedErrorsList = sortErrors(errorsList);
      return [
        isValid,
        sortedErrorsList
      ];
    }

    return [isValid, errors];
  }
};
